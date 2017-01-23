'use strict'
/**
 * Candidate Session
 */
var Candidate =  function (event) {
    var that = this; 
    var candidateApi = require('../../api/candidate.js')();
    var Session       = require('../../helpers/session.js')();
};

Candidate.prototype.welcomeMenu = function(event, callback) {

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

};

Candidate.prototype.auth = function (event, callback) {

    return that.askCPF(event, callback);
};

Candidate.prototype.askCPF = function (event, callback) {

    Session.put(event.sender.id, { 'nextPostback': { 'payload': "candidate->checkCPF" }});

    return callback({ 'text': 'Digite seu CPF' });            
};

Candidate.prototype.checkCPF = function (event, callback) {

    var that = this,
        text,
        payload,
        params = {};

    candidateApi.get({ cpf: event.message.text }, function(response) {

        if(!JSON.parse(response)[0]) {

            text = "Não encontrei nenhum candidato com este CPF, por favor, digite novamente :)";
            
            return callback({ 'text': text });
        }

        Session.put(event.sender.id, { 'apiData': {cpf: event.message.text} });
        Session.put(event.sender.id, { 'nextPayload': "candidate->askCandidateID" });

        return that.askCandidateID(event, callback);
    });
};

Candidate.prototype.askCandidateID = function (event, callback) {

    Session.put(event.sender.id, { 'nextPostback': { 'payload': "candidate->checkCandidateID" }});

    return callback({ 'text': 'Digite o seu código de candidato.' });           
};

Candidate.prototype.checkCandidateID = function (event, callback) {

    var that = this, 
        text,
        payload,
        params = {},
        apiData = Session.get(event.sender.id, 'apiData');

    if (event.message.text === "Esqueci" || event.message.text === "esqueci") return askCandidateBirthDate(event, callback);

    candidateApi.get({ 'cpf': apiData.cpf, 'candidateId': event.message.text }, function(response) {

        if(!JSON.parse(response)[0]) {
            
            return callback({ 'text': "Não encontrei nenhum candidato com este código, por favor, digite novamente. Caso tenha esquecido, digite \"Esqueci\"" });
        }

        Session.put(event.sender.id, { 'apiData': response[0] });

        return that.storeCandidateFacebookData(event, callback, response[0]);
    });
};

Candidate.prototype.askCandidateBirthDate = function (event, callback) {

    var that = this, 
        text,
        payload,
        params = {},
        apiData = Session.get(event.sender.id, 'apiData');

    candidateApi.get({ 'cpf': apiData.cpf, 'birthdate': event.message.text }, function(response) {

        if(!JSON.parse(response)[0]) {
            
            return callback({ 'text': "Não encontrei nenhum candidato com este cpf que nasceu nesta data :(" });
        }

        Session.put(event.sender.id, { 'apiData': response[0] });

        return that.storeCandidateFacebookData(event, callback, response[0]);
    });
};

Candidate.prototype.storeCandidateFacebookData = function (event, callback, candidateData) {

    var that = this;

    candidateData.facebookId = event.sender.id;

    return CandidateApi.put(candidateData._id, data, function () { 

        return that.welcomeMenu(event, callback);
    });
};

Candidate.prototype.paymentInformationMenu = function(event, callback) {

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

};

Candidate.prototype.contestInformationMenu = function(event, callback) {

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
};

Candidate.prototype.howCanIPrepareMyself = function (event, callback) {

    return callback({'text': 'Preparamos um simulado muito bacana para você se preparar para nosso processo seletivo, veja neste link www.website.com'});
};

Candidate.prototype.otherInformation = function (event, callback) {

    return calback({'text': 'Por favor, digite sobre o que você deseja falar.'});
};

Candidate.prototype.subscribe = function (event, callback) {

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
var Candidate = new Candidate();

module.exports = Candidate;
