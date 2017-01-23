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
        chat: function (events, req, res) {

            var that = this;
 
            for (var i = 0; i < events.length; i++) {

                var message = {},
                    event = events[i];

                if (event.message && event.message.text || event.postback) {

                    var nextPostBack = Session.get(event.sender.id, 'nextPostBack');

                    if (!nextPostBack && !event.postback) {

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

                    console.log('------------------------speach---------------------------');
                    console.log(speach);
                    console.log(message());

                    that.storeMessage(event);

                    if(typeof message === "function") {
                         speach[arr[1]](event, function(newMessage) {

                            return that.sendMessage(event.sender.id, newMessage );
                        });
                    } else {
                        return that.sendMessage(event.sender.id, message);
                    }
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
                    Session.put(recipientId, { facebookData: body });
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
        sendMessage: function (recipientId, message) {

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
                    console.log("=====================Error=====================");
                    console.log('Error sending message: ', error);
                } else if (response.body.error) {
                    console.log("=====================body error=====================");
                    console.log('Error: ', response.body.error);
                }
            });
        }
    };
};

module.exports = Facebook;