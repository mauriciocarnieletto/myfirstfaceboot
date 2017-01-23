// Dependencies
var express     = require('express');
var bodyParser  = require('body-parser');
var request     = require('request');

// Express
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// FacebookBot
var facebook = require('./bot/facebook.js');

var fbot = facebook({
    access_token: (process.env.PAGE_ACCESS_TOKEN || "EAADQ9m8UU5YBAJuOGpPdSsOQnEKCtBYaT4JFSJF75Br5D6GpsVseiZBO9nj9rqM1S8fAZCArZCK4ANKHpIXTFZCXNrwHOC6s1fcDwAKuosg5POz64KJIW0XinFv3ftomJQAPin5GmdUUPY3ERfhS1OYt6EkYlpaGpDPWuGOPIgZDZD")
});


// Server frontpage
app.get('/', function (req, res) {

    res.send('<h1>This is TestBot Server!</h1> If you want to check it, access: <a href="https://www.bot.com/testmyfirstfaceboot/"><b>@testmyfirstfaceboot</b></a>');
});

/*
 * Handler to the fb authentication
 */
app.get('/webhook', function (req, res) {

    if (req.query['hub.verify_token'] === 'jubileia') {

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

    fbot.chat(req.body.entry[0].messaging, req, res, function () {

        res.sendStatus(200);
    });

});

// Service start
app.listen((process.env.PORT || 3000));
console.log('Faceboot is Running at ' + (process.env.PORT || 3000));