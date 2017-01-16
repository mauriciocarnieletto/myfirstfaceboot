// Dependencies
var express     = require('express');
var bodyParser  = require('body-parser');
var request     = require('request');
const NodeCache = require( "node-cache" );

// Express
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// NodeCache
const myCache = new NodeCache();

// Server frontpage
app.get('/', function (req, res) {

    res.send('<h1>This is TestBot Server!</h1> If you want to check it, access: <a href="https://www.facebook.com/testmyfirstfaceboot/">https://www.facebook.com/testmyfirstfaceboot/</a>');
});

/*
 * Handler to the facebooks authentication
 */
app.get('/webhook', function (req, res) {

    if (req.query['hub.verify_token'] === 'EAADQ9m8UU5YBAMHitJLqnWCXepsxKgpyfMDOWUHclkkOFYUnZCFxbb6cXTyAAqWwRna0SrkqVhGHRrPo5xJ2O9zXZAQe7Qzt0gZCKVpooFAJgBOSZCEs4nmNbCuZCafpnWOs4yduLg9hRlR6utnGKbN2TuTmctglDZAkyC4SqnUAZDZD') {

        res.send(req.query['hub.challenge']);

    } else {

        res.send('Error, wrong validation token');    

    }
});


/*
 * Handler to recive message
 */
app.post('/webhook', function (req, res) {

    var events = req.body.entry[0].messaging;

    for (i = 0; i < events.length; i++) {

        var bot = {},
            event = events[i];

        event.previousMessage = getPreviousMessage(event);
        
        storeMessage(event);

        if (event.message && event.message.text) {

            bot = require('./bot/welcome.js')(event);
            
            sendMessage(event.sender.id, bot['welcomeMenu'](event));

        } else if (event.postback) {

            console.log(event);

            var arr = event.postback.payload.split('->');

            bot = require('./bot/'+arr[0]+'.js')(event);
            
            sendMessage(event.sender.id, bot[arr[1]](event));
        }
        

    }

    res.sendStatus(200);
});

/*
 *  StoreMessage
 *  Stores the current message in memory
 */
function storeMessage(event) {

    return myCache.set(event.sender.id, event.message);
};

/*
 * getPreviousMessage
 * Get previouse message from user
 */
function getPreviousMessage(event) {

    return myCache.get(event.sender.id);
};

/*
 * sendMessage   
 * Get previouse message from user
 */
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


// Service start
app.listen((process.env.PORT || 3000));


function receivePostback(event) {

  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;
  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendMessage(senderID, {text: "Bem vindo bla bla bla"});
}
