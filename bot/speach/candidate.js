'use strict'

var candidateApi = require('../../api/candidate.js')();
var Session       = require('../../helpers/session.js')();
/**
 * Candidate Session
 */
function Candidate (event) {

    var that = this; 

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

            var that = this;

            this.isAuth(event, callback, function (event, callback) {

                return that.welcomeMenu(event, callback);

            }, function (event, callback) {

                return that.askCPF(event, callback);
            });
        },

        isAuth: function (event, callback, isAuthFunction, isNotAuthFunction) {

           Session.get(event.sender.id,'authAsCandidate', function (candidate) {
                
                if(typeof(candidate === "undefined")) {

                    return isNotAuthFunction(event, callback);
                } else {

                    return isAuthFunction(event, callback);
                } 
           });

        },

        askCPF: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "candidate->checkCPF" }});

            return callback({ 'text': 'Digite seu CPF' });            
        },

        checkCPF: function (event, callback) {

            var that = this,
                text,
                payload,
                params = {};

            candidateApi.get({ cpf: event.message.text }, function(response) {

                if(!response[0]) {

                    text = "Não encontrei nenhum candidato com este CPF, por favor, digite novamente :)";
                    
                    return callback({ 'text': text });
                }

                Session.put(event.sender.id, { 'apiData': {cpf: event.message.text} });
                Session.put(event.sender.id, { 'nextPayload': "candidate->askCandidateID" });

                return that.askCandidateID(event, callback);
            });
        },

        askCandidateID: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "candidate->checkCandidateID" }});

            return callback({ 'text': 'Digite o seu código de candidato.' });           
        },

        checkCandidateID: function (event, callback) {

            var that = this, 
                text,
                payload,
                params = {};

            if (event.message.text === "Esqueci" || event.message.text === "esqueci") return askCandidateBirthDate(event, callback);
            
            Session.get(event.sender.id, 'apiData', function (apiData) {
                
                candidateApi.get({ 'cpf': apiData.cpf, 'candidateId': event.message.text }, function(response) {

                    if(!response[0]) {
                        
                        return callback({ 'text': "Não encontrei nenhum candidato com este código, por favor, digite novamente. Caso tenha esquecido, digite \"Esqueci\"" });
                    }

                    Session.put(event.sender.id, { 'apiData': response[0] });

                    return that.storeCandidateFacebookData(event, callback, response[0]);
                });
                
            });
        },

        askCandidateBirthDate: function (event, callback) {

            var that = this, 
                text,
                payload,
                params = {};

            Session.get(event.sender.id, 'apiData', function (apiData) {

                candidateApi.get({ 'cpf': apiData.cpf, 'birthdate': event.message.text }, function(response) {

                    if(!response[0]) {

                        return callback({ 'text': "Não encontrei nenhum candidato com este cpf que nasceu nesta data :(" });
                    }

                    Session.put(event.sender.id, { 'apiData': response[0] });

                    return that.storeCandidateFacebookData(event, callback, response[0]);
                });
            });
        },

        storeCandidateFacebookData: function (event, callback, candidateData) {

            var that = this;

            candidateData.facebookId = event.sender.id;

            Session.put(event.sender.id, { 'authAsCandidate': true });
            
            return candidateApi.put(candidateData._id, candidateData, function (response) { 

                Session.put(event.sender.id, { 'candidateData': candidateData });

                return that.welcomeMenu(event, callback);
            });
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

        nf: function (event, callback) {

            return callback({
                "attachment":{
                    "type":"file",
                    "payload":{
                        "url":"https://www.fazenda.sp.gov.br/nfe/legislacao/manual_de_integracao_contribuinte_v202a.pdf"
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
                                "payload": "candidate->contestLocation"
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

        contestLocation: function (event, callback) {
 
            return callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Opet Nilo Peçanha",
                            "subtitle": "Faculdades Opet Campus Nilo Peçanha",
                            "image_url": "https://s3.amazonaws.com/awesomescreenshot/upload//265172/d3e37398-2235-45ab-6eca-74b78b4e5864.png?AWSAccessKeyId=AKIAJSCJQ2NM3XLFPVKA&Expires=1485554792&Signature=bbVoMcXbXCikVitNzCjaD7de5AU%3D",
                            "buttons": [{
                                "type": "web_url",
                                "title": "Clique para ver",
                                "url": "https://goo.gl/maps/AmVGToR1TBy"
                            }]
                        }]
                    }
                }
            });
        },

        howCanIPrepareMyself: function (event, callback) {

            return callback({'text': 'Preparamos um simulado muito bacana para você se preparar para nosso processo seletivo :) Veja neste link www.website.com'});
        },

        otherInformation: function (event, callback) {

            return callback({'text': 'Por favor, digite sobre o que você deseja falar.'});
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
                // // Digite seu nome
                // // Digite seu cpf
                // // Digite seu celular
                // // Digite seu email
                // // Canhoto?
                // // Trainee
                // {}

            // ];

            return callback(step[0]);
        }

    };
};

module.exports = Candidate;
