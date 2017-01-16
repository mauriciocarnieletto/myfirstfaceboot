/**
 * Welcome Session
 */
function Welcome(event) {
    
    return {

         welcomeMenu: function(event) {

            return {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [
                            {
                                "title": "Candidatx do Vestibular",
                                "subtitle": "Sou candidatx do vestibular",
                                "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
                                "buttons": [{
                                    "type": "postback",
                                    "title": "Ver Opções",
                                    "payload": "candidate->welcomeMenu"
                                }]
                            },{
                                "title": "Aluno",
                                "subtitle": "Sou um alunx",
                                "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
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
            };

        }
    };
};

module.exports = Welcome;
