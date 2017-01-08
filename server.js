// Dependencies
var express 	= require('express');
var bodyParser 	= require('body-parser');
var request 	= require('request');

// Express
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Server frontpage
app.get('/', function (req, res) {
    res.send('<h1>This is TestBot Server!</h1> If you want to check it, access: <a href="https://www.facebook.com/testmyfirstfaceboot/">https://www.facebook.com/testmyfirstfaceboot/</a>');
});

// handler the facebook authentication
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'EAADQ9m8UU5YBAMHitJLqnWCXepsxKgpyfMDOWUHclkkOFYUnZCFxbb6cXTyAAqWwRna0SrkqVhGHRrPo5xJ2O9zXZAQe7Qzt0gZCKVpooFAJgBOSZCEs4nmNbCuZCafpnWOs4yduLg9hRlR6utnGKbN2TuTmctglDZAkyC4SqnUAZDZD') {
      res.send(req.query['hub.challenge']);
    } else {
      res.send('Error, wrong validation token');    
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
		if (event.message && event.message.text) {
			if(["Cândidato", "Aluno Ensino Superior", "Aluno do Colégio"].contains(event.message.text)) {
				sendMessage(recipientId, "Bem vindo " + event.message.text);
			} else {
		    	firstMessage(event.sender.id, event.message.text);
			}
		} else if (event.postback) {
		    console.log("Postback received: " + JSON.stringify(event.postback));
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

// Send the first Message
function firstMessage(recipientId, text) {

    message = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Cândidato",
                    "subtitle": "Candidato do Vestibular",
                    "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Candidato",
                        "payload": "User:" + recipientId + "is:Candidate"
                    }]
                }, {
                    "title": "Aluno Ensino Superior",
                    "subtitle": "Aluno do Ensino Superior",
                    "image_url": "https://image.shutterstock.com/display_pic_with_logo/162265/275161592/stock-photo-female-hands-with-pen-writing-on-notebook-275161592.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Aluno Ensino Superior",
                        "payload": "User:" + recipientId + "is:Student",
                    }]
                }, {
                    "title": "Aluno Colégio",
                    "subtitle": "Aluno do Colégio",
                    "image_url": "https://image.shutterstock.com/display_pic_with_logo/1151480/301162325/stock-photo-back-to-school-background-with-rocket-made-from-pencils-301162325.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Aluno do Colégio",
                        "payload": "User:" + recipientId + "is:Student",
                    }]
                }]
            }
        }
    };

    sendMessage(recipientId, message);
};

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

// Service start
app.listen((process.env.PORT || 3000));
