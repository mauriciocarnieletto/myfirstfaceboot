'use strict'
// Request
const request     = require('request');
const util        = require('util');

var Session       = require('../helpers/session.js');

/**
 * Facebook
 */
function Facebook() {

    var fb = {
        access_token: (process.env.PAGE_ACCESS_TOKEN || "EAADQ9m8UU5YBAJuOGpPdSsOQnEKCtBYaT4JFSJF75Br5D6GpsVseiZBO9nj9rqM1S8fAZCArZCK4ANKHpIXTFZCXNrwHOC6s1fcDwAKuosg5POz64KJIW0XinFv3ftomJQAPin5GmdUUPY3ERfhS1OYt6EkYlpaGpDPWuGOPIgZDZD")
    };

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

                    event.previousEvent = that.getPreviousEvent(event);

                    if (!event.previousEvent.nextPostBack && !event.postback) {

                        message = { 'text': 'Desculpe, não entendi.' };

                    } else if (
                        (event.previousEvent.nextPostBack && event.message && event.message.text)
                        || (event.postback)
                    ) {
                        var payload = (event.postback) ? event.postback.payload : event.previousEvent.nextPostBack.payload;
                        
                        var arr = payload.split('->');
                        var speach = require('../bot/speach/'+arr[0]+'.js')(event);

                        message = speach[arr[1]];
                    }

                    if(typeof message === "function") {

                        message(event, function(newMessage) {

                            if(typeof newMessage.nextPostBack !== "undefined" ) event.nextPostBack = newMessage.nextPostBack;

                            that.storeMessage(event);

                            that.sendMessage(event.sender.id, (typeof newMessage.nextPostBack !== "undefined" ) ? newMessage.message : newMessage , res, req);
                        });
                    } else {

                        if(typeof message.nextPostBack !== "undefined" ) event.nextPostBack = message.nextPostBack;

                        that.storeMessage(event);

                        that.sendMessage(event.sender.id, (typeof message.nextPostBack !== "undefined" ) ? message.message : message , res, req);
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
                    access_token: fb.access_token, 
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

            return Session.get(event.sender.id);
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
                    qs: { access_token: fb.access_token} ,
                    method: 'POST',
                    json: {
                        recipient: { id: recipientId },
                        message: message,
                    }
                }));
            } else {
                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: { access_token: fb.access_token },
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