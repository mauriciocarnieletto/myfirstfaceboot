// NodeCache
const NodeCache = require('node-cache');
const myCache = new NodeCache();

// Request
var request     = require('request');

var util        = require('util');


/*
 *  storeMessage
 *  Stores the current message in memory
 */
function storeMessage (event) {

    return myCache.set(event.sender.id, event);
};

/*
 * getPreviousEvent
 * Get previouse message from user
 */
function getPreviousEvent (event) {

    var prevEv = myCache.get(event.sender.id);

    return (prevEv) ? prevEv : {};
};

/*
 * sendMessage , res  
 * Get previouse message from user
 */
function sendMessage (recipientId, message, res) {
    // res.send(message);
    // console.log('---------------------message----------------------');
    // console.log(util.inspect(message));
    // console.log('---------------------inspect----------------------');
    // console.log(util.inspect({
    //     url: 'https://graph.facebook.com/v2.6/me/messages',
    //     qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    //     method: 'POST',
    //     json: {
    //         recipient: { id: recipientId },
    //         message: message,
    //     }
    // }));

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
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

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

console.log('start chat');

            for (i = 0; i < events.length; i++) {

                var message = {},
                    event = events[i];

                event.previousEvent = getPreviousEvent(event);

console.log('got previousEvent', event);

                if (!event.previousEvent.nextPostBack && event.message && event.message.text) {
console.log('message text');

                    message = { 'text': 'Desculpe, não entendi.' };

                } else if(event.previousEvent.nextPostBack && event.message && event.message.text) {
console.log('next postback');
                    var arr = event.previousEvent.nextPostBack.payload.split('->');

                    var speach = require('../bot/speach/'+arr[0]+'.js')(event);

                    message = speach[arr[1]];

                } else if (event.postback) {
console.log('postback'); 

                    var arr = event.postback.payload.split('->');

                    var speach = require('../bot/speach/'+arr[0]+'.js')(event);

                    message = speach[arr[1]];
                }

console.log('message: ', message);

                if(typeof message === "function") {

                    message(event, function(newMessage) {

                        if(typeof newMessage.nextPostBack !== "undefined" ) event.nextPostBack = newMessage.nextPostBack;

                        storeMessage(event);

                        delete newMessage.nextPostBack;

                        sendMessage(event.sender.id, newMessage, res);
            
                    });

                } else {

                    storeMessage(event);

                    sendMessage(event.sender.id, message, res);
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
    };
};

module.exports = Facebook;