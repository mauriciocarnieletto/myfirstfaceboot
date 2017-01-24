'use strict'

// Request
const request     = require('request');
const util        = require('util');

var Session       = require('../helpers/session.js')();

/**
 * Facebook
 */
function Facebook(fbConfig) {

    return {
        /*
         * chat   
         * Listen and respond
         */
        chat: function (events, cb) {


            var that = this;
 
            for (var i = 0; i < events.length; i++) {

                var message = {},
                    event = events[i];


                if ((event.message && event.message.text && !event.message.is_echo) || (event.postback && event.postback.payload)) {

                    if(typeof Session.get(event.sender.id) === "undefined") {

                        that.getProfile(event.sender.id, event, {

                            onSucces: function (response) {

                                Session.set(event.sender.id, { facebookData: response });
                            }
                        });
                    }

                    var sessionData = Session.get(event.sender.id);

                    console.log(sessionData);

                    var nextPostBack = (typeof sessionData !== "undefined") ? sessionData.nextPostBack : false;

                    if (!nextPostBack && !event.postback && !event.message.is_echo) {

                        message = { 'text': 'Desculpe, não entendi.' };

                    } else if (
                        (nextPostBack && event.message && event.message.text)
                        || (event.postback)
                    ) {
                        var payload = (event.postback) ? event.postback.payload : nextPostBack.payload;
                        
                        var arr = payload.split('->');
                        var speach = require('../bot/speach/'+arr[0]+'.js')();

                        message = speach[arr[1]];
                    }
                    if(typeof message === "function") {

                         message.call(speach, event, function(newMessage) {

                            return that.sendMessage(event.sender.id, newMessage, cb);
                        });
                    } else {
                        return that.sendMessage(event.sender.id, message, cb);
                    }
                } else {

                    cb.onSuccess();
                }
            }
        },

        /*
         * getProfile   
         * Get previouse message from user
         */
        getProfile: function (recipientId, event, cb) {

            request({
                url: 'https://graph.facebook.com/v2.6/' + recipientId,
                qs: { 
                    access_token: fbConfig.access_token, 
                    fields: 'first_name,last_name,profile_pic,locale,timezone,gender' 
                },
                method: 'GET',
                json: true
            }, function (error, response, body) {
                if(error) {
                    console.log('Error requesting data: ', error);
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error)
                } else {
                    cb.onSucces(body);
                }
            });
        },

        /*
         *  storeMessage
         *  Stores the current message in memory
         */
        storeMessage: function (event) {

            return Session.set(event.sender.id, { previousEvent: event });
        },

        /*
         * getPreviousEvent
         * Get previouse message from user
         */
        getPreviousEvent: function (event) {

            var previousEvent = Session.get(event.sender.id, 'previousEvent');

            return (previousEvent || {});
        },

        /*
         * sendMessage , res  
         * Get previouse message from user
         */
        sendMessage: function (recipientId, message, cb) {

            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: fbConfig.access_token },
                method: 'POST',
                json: {
                    recipient: { id: recipientId },
                    message: message,
                }
            }, function(error, response, body) {
                if (error) {
                    cb.onError(error);
                } else if (response.body.error) {
                    cb.onError(response.body.error);
                } else {
                    cb.onSuccess(response);
                }
            });
        }
    };
};

module.exports = Facebook;