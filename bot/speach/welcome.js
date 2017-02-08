'use strict'

var Welcome = function (event) {
    
    return {

         welcomeMenu: function(event, callback) {

            console.log(event, callback);

            return callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Bem vindo à Opet!",
                                "subtitle": "Selecione uma opção abaixo ;)",
                                "image_url": "http://www.opet.com.br/faculdade/wp-content/uploads/2013/09/Fachada-campus-1-abril06.jpg",
                                "buttons": [{
                                    "type": "postback",
                                    "title": "Sou aluno Opet",
                                    "payload": "student->auth"
                                },{
                                    "type": "postback",
                                    "title": "Sou Candidato",
                                    "payload": "candidate->auth"
                                },{
                                    "type": "postback",
                                    "title": "Quero ser Aluno Opet",
                                    "payload": "subscribe->new"
                                }]
                            }
                        ]
                    }
                }
            });
        }
    };
};


module.exports = Welcome;
