/**
 * Candidate Session
 */
function Candidate(event) {
    
    var recipientId,
        message;

    return {

         welcomeMenu: function(event) {

            return {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Bem vindo Candidato",
                            "subtitle": "Selecione uma opção",
                            // "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
                            "buttons": [{
                                "type": "postback",
                                "title": "Informações Financeiras",
                                "payload": "candidate->auth"
                            },{
                                "type": "postback",
                                "title": "Informações do Concurso",
                                "payload": "candidate->auth"
                            },{
                                "type": "postback",
                                "title": "Outros",
                                "payload": "candidate->auth"
                            }]
                        }]
                    }
                }
            };

        },

        auth: function(event) {

            return {
                "text": "Digite seu CPF"
            };

        },

        paymentInformationMenu: function(event) {

            return {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Bem vindo Candidato",
                            "subtitle": "Selecione uma opção",
                            "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
                            "buttons": [{
                                "type": "postback",
                                "title": "Informações Financeiras",
                                "payload": "auth&candidatePaymentInformation"
                            },{
                                "type": "postback",
                                "title": "Informações do Concurso",
                                "payload": "auth&candidateContestInformation"
                            },{
                                "type": "postback",
                                "title": "Outros",
                                "payload": "candidateOtherInformation"
                            }]
                        }]
                    }
                }
            };

        },

        contestInformationMenu: function(event) {

            return {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Bem vindo Candidato",
                            "subtitle": "Selecione uma opção",
                            "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
                            "buttons": [{
                                "type": "postback",
                                "title": "Informações Financeiras",
                                "payload": "auth&candidatePaymentInformation"
                            },{
                                "type": "postback",
                                "title": "Informações do Concurso",
                                "payload": "auth&candidateContestInformation"
                            },{
                                "type": "postback",
                                "title": "Outros",
                                "payload": "candidateOtherInformation"
                            }]
                        }]
                    }
                }
            };

        }

    };
};

module.exports = Candidate;
