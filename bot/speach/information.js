/**
 * Information Session
 */
var Information = {

     welcome: function(recipientId, message) {

        return {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Informações",
                        "subtitle": "Selecione uma opção",
                        "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
                        "buttons": [{
                            "type": "postback",
                            "title": "Quero ser um Aluno Opet",
                            "payload": "candidate->subscribe"
                        },{
                            "type": "postback",
                            "title": "Informações sobre a Cidade Mirim",
                            "payload": "mirimCity->welcomeMenu"
                        },{
                            "type": "postback",
                            "title": "Outros",
                            "payload": "information->others"
                        }]
                    }]
                }
            }
        };
    },

    becomeStudent: function () {

    },

    others: function () {

    }

};

module.exports = Information;
