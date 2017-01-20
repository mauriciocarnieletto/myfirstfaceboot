// Request
var request     = require('request');

// QueryString
var querystring = require('querystring');

/**
 *  Candidate API
 */
function Candidate() {

    var baseApiRout = 'https://lyceumexapi.herokuapp.com/api/candidate/';

    return {

        get: function (data, onSuccess, onError) {

            var getData;

            request({
                'method': 'get',
                'url': baseApiRout + '?' + querystring.stringify(data),
                'content-type': 'application/json',
            }, function(error, response, body) {

                if(error && onError) {
                    onError(error);
                } else {

                    onSuccess(body);
                }
            });
        },

        post: function (data, onSuccess, onError) {

            request({
                'method': 'post',
                'url': baseApiRout,
                'multipart': [
                    {
                        'content-type': 'application/json',
                        'body': JSON.stringify(data)
                    }
                ]
            }, function(error, response, body) {

                if(error && onError) {

                    onError(error);
                } else {

                    onSuccess(body);
                }
            });
        },

        put: function (id, data, onSuccess, onError) {

            request({
                'method': 'put',
                'url': baseApiRout + '/' + id,
                'json': data
            }, function(error, response, body) {
                
                if(error && onError) {

                    onError(error);
                } else {

                    onSuccess(body);
                }
            });
        }

    };
};

module.exports = Candidate;