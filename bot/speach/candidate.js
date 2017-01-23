const util = require('util');

var candidateApi = require('../../api/candidate.js')();

/**
 * Candidate Session
 */
function Candidate(event) {

    return {

        welcomeMenu: function(event, callback) {

            return callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Bem vindo Candidato!",
                            "subtitle": "Selecione uma opção para continuar",
                            "buttons": [{
                                "type": "postback",
                                "title": "Informações Financeiras",
                                "payload": "candidate->paymentInformationMenu"
                            },{
                                "type": "postback",
                                "title": "Informações do Concurso",
                                "payload": "candidate->contestInformationMenu"
                            },{
                                "type": "postback",
                                "title": "Outros",
                                "payload": "candidate->otherInformation"
                            }]
                        }]
                    }
                }
            });

        },

        auth: function (event, callback) {

            return this.askCPF(event, callback);
        },

        askCPF: function (event, callback) {

            return callback({ 
                'message': {
                    'text': 'Digite seu CPF'
                }, 
                'nextPostback': { 
                    'payload': "candidate->checkCPF",
                } 
            });            

        },

        checkCPF: function (event, callback) {

            var text,
                payload,
                params = {};

            candidateApi.get({ cpf: event.message.text }, function(response) {

                if(!JSON.parse(response)[0]) {

                    text = "Não encontrei nenhum candidato com este CPF, por favor, digite novamente :)";
                    payload = "candidate->checkCPF";
                }

                params.cpf = event.message.text;
                payload = "candidate->askCandidateID";

                return callback({ 
                    'message': {
                        'text': text
                    }, 
                    'nextPostback': { 
                        'payload': payload
                    } 
                });
            });
        },

        askCandidateID: function (event, callback) {

        },

        checkCandidateID: function (event, callback) {},

        storeCandidateFacebookData: function (event, callback) {},

        paymentInformationMenu: function(event, callback) {

            return callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Informações Financeiras",
                            "subtitle": "Selecione uma opção",
                            "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
                            "buttons": [{
                                "type": "web_url",
                                "title": "Segunda Via Boleto",
                                "url": "https://upload.wikimedia.org/wikipedia/commons/c/c7/BoletoBancario.png"
                            },{
                                "type": "postback",
                                "title": "Nota Fiscal",
                                "payload": "candidate->nf"
                            },{
                                "type": "postback",
                                "title": "Outros",
                                "payload": "candidate->otherInformation"
                            }]
                        }]
                    }
                }
            });

        },

        contestInformationMenu: function(event, callback) {

            return callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Informações sobre o concurso",
                            "subtitle": "Selecione uma opção",
                            "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
                            "buttons": [{
                                "type": "postback",
                                "title": "Local da Prova",
                                "payload": "auth&candidatePaymentInformation"
                            },{
                                "type": "postback",
                                "title": "Como posso me preparar?",
                                "payload": "candidate->howCanIPrepareMyself"
                            },{
                                "type": "postback",
                                "title": "Outros",
                                "payload": "candidate->otherInformation"
                            }]
                        }]
                    }
                }
            });
        },

        howCanIPrepareMyself: function (event, callback) {

            return callback({'text': 'Preparamos um simulado muito bacana para você se preparar para nosso processo seletivo, veja neste link www.website.com'});
        },

        otherInformation: function (event, callback) {

            return calback({'text': 'Por favor, digite sobre o que você deseja falar.'});
        },

        subscribe: function (event, callback) {

            // var step = [
                // Selecione o curso
                return callback(
                {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "list",
                            "elements": [
                                {
                                    "title": "Direito",
                                    "subtitle": "Bacharelado | 4 anos",
                                    "default_action": {
                                        "type": "postback",
                                        "title": "Escolher",
                                        "payload": ""
                                    },
                                },{
                                    "title": "Admiistração",
                                    "subtitle": "Bacharelado | 4 anos",
                                    "default_action": {
                                        "type": "postback",
                                        "title": "Escolher",
                                        "payload": ""
                                    },
                                },{
                                    "title": "Engenharia Elétrica",
                                    "subtitle": "Bacharelado | 4 anos",
                                    "default_action": {
                                        "type": "postback",
                                        "title": "Escolher",
                                        "payload": ""
                                    },
                                },{
                                    "title": "Cosmética",
                                    "subtitle": "Bacharelado | 4 anos",
                                    "default_action": {
                                        "type": "postback",
                                        "title": "Escolher",
                                        "payload": ""
                                    },
                                }

                            ],
                             "buttons": [
                                {
                                    "title": "Ver Mais",
                                    "type": "postback",
                                    "payload": "payload"                        
                                }
                            ]  
                        }
                    }
                 });

                // // Selecione o turno
                // {},
                // // Digite seu nome
                // {},
                // // Digite seu cpf
                // {},
                // // Digite seu celular
                // {},
                // // Digite seu email
                // {},
                // // Canhoto?
                // {},
                // // Trainee
                // {}
 
            // ];

            return callback(step[0]);
        }

    };
};

module.exports = Candidate;
