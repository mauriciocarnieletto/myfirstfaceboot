// Dependencies
var express 	= require('express');
var bodyParser 	= require('body-parser');
var request 	= require('request');

// Express
var app 		= express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server! :D <br> If you want to check it, access: http://facebook.com/mauriciocarnieletto');
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
		if (event.message && event.message.text) {
		    if (!kittenMessage(event.sender.id, event.message.text)) {
		        sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
		    }
		} else if (event.postback) {
		    sendMessage(event.sender.id, {text: "Glad you like it"});
		}
    }
    res.sendStatus(200);
});


// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
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

// send rich message with kitten
function kittenMessage(recipientId, text) {
    
    text = text || "";
    var values = text.split(' ');
    
    if (values.length === 3 && values[0] === 'kitten') {
        if (Number(values[1]) > 0 && Number(values[2]) > 0) {
            
            var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);
            
            var messages = [];

            messageOne = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitten",
                            "subtitle": "Cute kitten picture",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show kitten"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }]
                        }]
                    }
                }
            };
    

    		messageTwo = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitten",
                            "subtitle": "Cute2 kitten2 picture2",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show kitten"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }]
                        }]
                    }
                }
            };

            messages.push(messageOne);
            messages.push(messageTwo);

            sendMessage(recipientId, message);

            return true;
        }
    }
    
    return false;
    
};


// Service start
app.listen((process.env.PORT || 3000));
