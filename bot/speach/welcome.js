'use strict'

var Welcome = function (event) {
    
    return {

         welcomeMenu: function(event, callback) {

            return callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Vestibular Opet",
                                "subtitle": "Informações sobre vestibular.",
                                "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
                                "buttons": [{
                                    "type": "postback",
                                    "title": "Sou Candidato",
                                    "payload": "candidate->auth"
                                },{
                                    "type": "postback",
                                    "title": "Quero ser Aluno Opet",
                                    "payload": "candidate->subscribe"
                                }]
                            },{
                                "title": "Aluno(a)",
                                "subtitle": "Sou um aluno(a)",
                                "image_url": "http://www.4freephotos.com/medium/batch/Math-notebook-on-student-table346.jpg",
                                "buttons": [{
                                    "type": "postback",
                                    "title": "Ensino Superior",
                                    "payload": "student->universityWelcome"
                                },{
                                    "type": "postback",
                                    "title": "Colégio",
                                    "payload": "student->schoolWelcome"
                                }
                            ]
                        }]
                    }
                }
            });
        }
    };
};


module.exports = Welcome;
