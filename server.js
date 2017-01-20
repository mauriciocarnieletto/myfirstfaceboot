// Dependencies
var express     = require('express');
var bodyParser  = require('body-parser');
var request     = require('request');

// Express
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// FacebookBot
var facebook = require('./bot/facebook.js')();

// Server frontpage
app.get('/', function (req, res) {

    // var events = [{
    //         message: {
    //             text: (typeof req.query['message'] !== "undefined") ? req.query['message'] : undefined,
    //         },
    //         postback: {
    //             payload: (typeof req.query['payload'] !== "undefined") ? req.query['payload'] : undefined,
    //         },
    //         sender: {
    //             id: req.query['id'],
    //         }
    //     }];

    // facebook.chat(events, req, res, function () { });

    res.send('<h1>This is TestBot Server!</h1> If you want to check it, access: <a href="https://www.facebook.com/testmyfirstfaceboot/"><b>@testmyfirstfaceboot</b></a>');
});

/*
 * Handler to the facebooks authentication
 */
app.get('/webhook', function (req, res) {

    if (req.query['hub.verify_token'] === 'EAADQ9m8UU5YBAMHitJLqnWCXepsxKgpyfMDOWUHclkkOFYUnZCFxbb6cXTyAAqWwRna0SrkqVhGHRrPo5xJ2O9zXZAQe7Qzt0gZCKVpooFAJgBOSZCEs4nmNbCuZCafpnWOs4yduLg9hRlR6utnGKbN2TuTmctglDZAkyC4SqnUAZDZD') {

        res.send(req.query['hub.challenge']);
    } else {

        res.send('Error, wrong validation token');

        res.sendStatus(403);
    }
});

/*
 * Handler to recive message
 */
app.post('/webhook', function (req, res) {

    if (!req.body.entry) return res.sendStatus(403);

    facebook.chat(req.body.entry[0].messaging, req, res, function () {

        res.sendStatus(200);
    });

});


// Service start
app.listen((process.env.PORT || 3000));

console.log('Faceboot is Running at 3000 :O');
