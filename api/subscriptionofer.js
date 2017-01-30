// Request
var request     = require('request');

// QueryString
var querystring = require('querystring');

/**
 *  SubscriptionOffer API
 */
function SubscriptionOffer() {

    var baseApiRout = 'https://lyceumexapi.herokuapp.com/api/subscriptionoffer';

    return {

        getByName: function (name, onSuccess, onError) {

            var getData;

            request({
                'method': 'get',
                'url': baseApiRout + '?name__regex=/' + querystring.stringify(name) + '/i',
                'content-type': 'application/json',
            }, function(error, response, body) {

                if(error && onError) {
                    onError(error);
                } else {
                    onSuccess(JSON.parse(body));
                }
            });
        }
    };
};

module.exports = SubscriptionOffer;