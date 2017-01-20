var speach = {
    "askForCandidateCpf": { 
        'text': 'Digite seu CPF', 
        'nextPostBack': { 
            'payload': "candidate->auth",
            'params': { 'askedCpf': true }
        } 
    }, 
    "askForCandidateId": {
        'text': 'Digite seu código de candidato',
        'nextPostBack' : {
            'params': { 
                'askedCpf': true,
                'askedCandidateId': true,
                'cpf': '' 
            },
            'payload': "candidate->welcomeMenu"
        }
    }
};

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


        auth: function(event, callback) {
            
            var filter = {},
                message;

            // if the user is sending a message, must have a nextpostback
            if((event.message && event.message.text)) {

                // if there is another nextPostBack object
                if(event.previousEvent.nextPostBack) {

                    // if the previous postback has asked for candidate cpf and candidate is suplying his cpf now
                    if(event.previousEvent.nextPostBack.params.askedCpf 
                        && typeof event.previousEvent.nextPostBack.params.cpf === "undefined") {

                        filter.cpf = event.message.text;
                
                        candidateApi.get(filter, function(response) {
    
                            if(!JSON.parse(response)[0]) {

                                speach.askForCandidateCpf.text = "Não encontrei nenhum candidato com este CPF, por favor, digite novamente :)";

                                return callback(speach.askForCandidateCpf);
                            }

                            speach.askForCandidateId.nextPostBack.params.cpf = event.message.text;

                            return callback(speach.askForCandidateId);
                        });

                    }

                    // if the previous postback has asked for candidate cpf and candidate is suplying his cpf now
                    else if(event.previousEvent.nextPostBack.params.askedCpf 
                        && event.previousEvent.nextPostBack.params.askedCandidateId 
                        && typeof event.previousEvent.nextPostBack.params.cpf
                        && typeof event.previousEvent.nextPostBack.params.candidateId === "undefined") {

                        filter.ra = event.message.text;
                        filter.cpf = event.previousEvent.nextPostBack.params.cpf;

                        candidateApi.get(filter, function(response) {

                            if(!JSON.parse(response)[0]) {

                                speach.nextPostBack.params.cpf = event.previousEvent.nextPostBack.params.cpf;

                                speach.askForCandidateId.text = "Você digitou um código não válido para este Cpf. Vamos tentar mais uma vez? :)";
                                speach.askForCandidateId.nextPostback = "candidate->auth";

                                return callback(speach.askForCandidateId);
                            }

                            speach.askForCandidateId.ra = event.message.text;

                            var candidate = JSON.parse(response)[0];
                            var candidateId = candidate._id;

                            delete candidate._id;

                            candidate.facebookId = event.sender.id;
                            
                            candidateApi.put(candidateId, candidate, function (response) {

                                return callback(speach.askForCandidateId);
                            });

                        });

                    }


                // respond user for the first time
                } else {

                    return callback(speach.askForCandidateCpf);
                }

            } else {

                return callback(speach.askForCandidateCpf);
            }

        },

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
                return callback({
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "list",
                            "elements": [
                                {
                                    "title": "Direito",
                                    "subtitle": "See all our colors",
                                    "default_action": {
                                        "type": "web_url",
                                        "url": "https://peterssendreceiveapp.ngrok.io/shop_collection",
                                        "messenger_extensions": true,
                                        "webview_height_ratio": "tall",
                                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                                    },
                                    "buttons": [
                                        {
                                            "title": "View",
                                            "type": "web_url",
                                            "url": "https://peterssendreceiveapp.ngrok.io/collection",
                                            "messenger_extensions": true,
                                            "webview_height_ratio": "tall",
                                            "fallback_url": "https://peterssendreceiveapp.ngrok.io/"                        
                                        }
                                    ]
                                },
                                {
                                    "title": "Classic White T-Shirt",
                                    "image_url": "https://peterssendreceiveapp.ngrok.io/img/white-t-shirt.png",
                                    "subtitle": "100% Cotton, 200% Comfortable",
                                    "default_action": {
                                        "type": "web_url",
                                        "url": "https://peterssendreceiveapp.ngrok.io/view?item=100",
                                        "messenger_extensions": true,
                                        "webview_height_ratio": "tall",
                                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                                    },
                                    "buttons": [
                                        {
                                            "title": "Shop Now",
                                            "type": "web_url",
                                            "url": "https://peterssendreceiveapp.ngrok.io/shop?item=100",
                                            "messenger_extensions": true,
                                            "webview_height_ratio": "tall",
                                            "fallback_url": "https://peterssendreceiveapp.ngrok.io/"                        
                                        }
                                    ]                
                                },
                                {
                                    "title": "Classic Blue T-Shirt",
                                    "image_url": "https://peterssendreceiveapp.ngrok.io/img/blue-t-shirt.png",
                                    "subtitle": "100% Cotton, 200% Comfortable",
                                    "default_action": {
                                        "type": "web_url",
                                        "url": "https://peterssendreceiveapp.ngrok.io/view?item=101",
                                        "messenger_extensions": true,
                                        "webview_height_ratio": "tall",
                                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                                    },
                                    "buttons": [
                                        {
                                            "title": "Shop Now",
                                            "type": "web_url",
                                            "url": "https://peterssendreceiveapp.ngrok.io/shop?item=101",
                                            "messenger_extensions": true,
                                            "webview_height_ratio": "tall",
                                            "fallback_url": "https://peterssendreceiveapp.ngrok.io/"                        
                                        }
                                    ]                
                                },
                                {
                                    "title": "Classic Black T-Shirt",
                                    "image_url": "https://peterssendreceiveapp.ngrok.io/img/black-t-shirt.png",
                                    "subtitle": "100% Cotton, 200% Comfortable",
                                    "default_action": {
                                        "type": "web_url",
                                        "url": "https://peterssendreceiveapp.ngrok.io/view?item=102",
                                        "messenger_extensions": true,
                                        "webview_height_ratio": "tall",
                                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                                    },
                                    "buttons": [
                                        {
                                            "title": "Shop Now",
                                            "type": "web_url",
                                            "url": "https://peterssendreceiveapp.ngrok.io/shop?item=102",
                                            "messenger_extensions": true,
                                            "webview_height_ratio": "tall",
                                            "fallback_url": "https://peterssendreceiveapp.ngrok.io/"                        
                                        }
                                    ]                
                                }
                            ],
                             "buttons": [
                                {
                                    "title": "View More",
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
 
            ];

            return callback(step[0]);
        }

    };
};

module.exports = Candidate;
