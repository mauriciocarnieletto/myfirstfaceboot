'use strict'
// NodeCache
const NodeCache = require('node-cache');
const myCache = new NodeCache();

// Request
var request     = require('request');

var util        = require('util');

/**
 * Facebook
 */
function Facebook() {

    return {

        /*
         * chat   
         * Listen and respond
         */
        chat: function (events, req, res) {

            var that = this;

            for (var i = 0; i < events.length; i++) {

                var message = {},
                    event = events[i];

                event.previousEvent = that.getPreviousEvent(event);

                if (!event.previousEvent.nextPostBack && event.message && event.message.text) {

                    message = { 'text': 'Desculpe, não entendi.' };

                } else if(event.previousEvent.nextPostBack && event.message && event.message.text) {

                    var arr = event.previousEvent.nextPostBack.payload.split('->');
                    var speach = require('../bot/speach/'+arr[0]+'.js')(event);
                    message = speach[arr[1]];

                } else if (event.postback) {
                    var arr = event.postback.payload.split('->');
                    var speach = require('../bot/speach/'+arr[0]+'.js')(event);
                    message = speach[arr[1]];
                }

                if(typeof message === "function") {
                    message(event, function(newMessage) {
                        if(typeof newMessage.nextPostBack !== "undefined" ) event.nextPostBack = newMessage.nextPostBack;
                        that.storeMessage(event);
                        delete newMessage.nextPostBack;
                        that.sendMessage(event.sender.id, newMessage, res, req);
                    });
                } else {
                    that.storeMessage(event);
                    that.sendMessage(event.sender.id, message, res, req);
                }
           }
        },

        /*
         * getProfile   
         * Get previouse message from user
         */
        getProfile: function (recipientId, event) {

            return request({
                url: 'https://graph.facebook.com/v2.6/${recipientId}',
                qs: { 
                    access_token: process.env.PAGE_ACCESS_TOKEN, 
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
                    storeUserData(event, response, body);
                }
            });
        },

        /*
         *  storeMessage
         *  Stores the current message in memory
         */
        storeMessage: function (event) {

            return myCache.set(event.sender.id, event);
        },

        /*
         * getPreviousEvent
         * Get previouse message from user
         */
        getPreviousEvent: function (event) {

            var prevEv = myCache.get(event.sender.id);

            return (prevEv) ? prevEv : {};
        },

        /*
         * sendMessage , res  
         * Get previouse message from user
         */
        sendMessage: function (recipientId, message, res, req) {

            console.log('---------------------message----------------------');
            console.log(util.inspect(message));

            if(req.query['debug'] == 1) {

                res.send(JSON.stringify(message));
                console.log('---------------------message----------------------');
                console.log(util.inspect(message));
                console.log('---------------------inspect----------------------');

                console.log(util.inspect({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
                    method: 'POST',
                    json: {
                        recipient: { id: recipientId },
                        message: message,
                    }
                }));
            } else {
                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
                    method: 'POST',
                    json: {
                        recipient: { id: recipientId },
                        message: message,
                    }
                }, function(error, response, body) {
                    if (error) {
                        console.log("=====================Error=====================");
                        console.log('Error sending message: ', error);
                    } else if (response.body.error) {
                        console.log("=====================body error=====================");
                        console.log('Error: ', response.body.error);
                    }
                });
            }
        },

    };
};

module.exports = Facebook;