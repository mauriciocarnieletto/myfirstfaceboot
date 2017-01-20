/**
 * Information Session
 */
var Information = {

    welcomeMenu: function() {

        return {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Cidade Mirim",
                        "subtitle": "Selecione uma opção",
                        "image_url": "http://www.opet.com.br/colegio/wp-content/uploads/2014/05/POSTAL-CIDADE.jpg",
                        "buttons": [{
                            "type": "postback",
                            "title": "Informações sobre o projeto",
                            "payload": "mirimCity->info"
                        },{
                            "type": "postback",
                            "title": "Agendar uma visita",
                            "payload": "mirimCity->schedule"
                        },{
                            "type": "postback",
                            "title": "Outros",
                            "payload": "mirimCity->others"
                        }]
                    }]
                }
            }
        };
    },

    info: function () {

    },

    schedule: function () {

    },

    others: function () {

    }
};



module.exports = Information;
