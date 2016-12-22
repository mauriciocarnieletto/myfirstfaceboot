var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server! :D <br> If you want to check it, access: http://facebook.com/mauriciocarnieletto');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'EAADQ9m8UU5YBAMHitJLqnWCXepsxKgpyfMDOWUHclkkOFYUnZCFxbb6cXTyAAqWwRna0SrkqVhGHRrPo5xJ2O9zXZAQe7Qzt0gZCKVpooFAJgBOSZCEs4nmNbCuZCafpnWOs4yduLg9hRlR6utnGKbN2TuTmctglDZAkyC4SqnUAZDZD') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});