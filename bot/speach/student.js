'use strict'

var StudentApi = require('../../api/student.js')();
var Session       = require('../../helpers/session.js')();
/**
 * Student Session
 */
function Student (event) {

    var that = this; 

    return {

        welcomeMenu: function(event, callback) {

            return callback({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Bem vindo Aluno Opet!",
                            "subtitle": "Selecione uma opção para continuar",
                            "image_url": "http://www.bemparana.com.br/upload/image/noticia/noticia_254312_img1_gamification.jpg",
                            "buttons": [{
                                "type": "postback",
                                "title": "Informações Financeiras",
                                "payload": "student->paymentInformationMenu"
                            }, {
                                "type": "postback",
                                "title": "Outros",
                                "payload": "student->otherInformation"
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

           Session.get(event.sender.id,'authAsStudent', function (Student) {
                
                if(typeof(Student === "undefined")) {

                    return isNotAuthFunction(event, callback);
                } else {

                    return isAuthFunction(event, callback);
                } 
           });

        },

        askCPF: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "student->checkCPF" }});

            return callback({ 'text': 'Digite seu CPF' });            
        },

        checkCPF: function (event, callback) {

            var that = this,
                text,
                payload,
                params = {};

            StudentApi.get({ cpf: event.message.text }, function(response) {

                if(!response[0]) {

                    text = "Não encontrei nenhum aluno com este CPF, por favor, digite novamente :)";
                    
                    return callback({ 'text': text });
                }

                Session.put(event.sender.id, { 'apiData': {cpf: event.message.text} });
                Session.put(event.sender.id, { 'nextPayload': "student->askStudentID" });

                return that.askStudentID(event, callback);
            });
        },

        askStudentID: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "student->checkStudentID" }});

            return callback({ 'text': 'Digite o seu código de matrícula.' });           
        },

        checkStudentID: function (event, callback) {

            var that = this, 
                text,
                payload,
                params = {};

            if (event.message.text === "Esqueci" || event.message.text === "esqueci") return askStudentBirthDate(event, callback);
            
            Session.get(event.sender.id, 'apiData', function (apiData) {
                
                StudentApi.get({ 'cpf': apiData.cpf, 'StudentId': event.message.text }, function(response) {

                    if(!response[0]) {
                        
                        return callback({ 'text': "Não encontrei nenhum aluno com este código, por favor, digite novamente. Caso tenha esquecido, digite \"Esqueci\"" });
                    }

                    Session.put(event.sender.id, { 'apiData': response[0] });

                    return that.storeStudentFacebookData(event, callback, response[0]);
                });
                
            });
        },

        askStudentBirthDate: function (event, callback) {

            var that = this, 
                text,
                payload,
                params = {};

            Session.get(event.sender.id, 'apiData', function (apiData) {

                StudentApi.get({ 'cpf': apiData.cpf, 'birthdate': event.message.text }, function(response) {

                    if(!response[0]) {

                        return callback({ 'text': "Não encontrei nenhum aluno com este cpf que nasceu nesta data :(" });
                    }

                    Session.put(event.sender.id, { 'apiData': response[0] });

                    return that.storeStudentFacebookData(event, callback, response[0]);
                });
            });
        },

        storeStudentFacebookData: function (event, callback, StudentData) {

            var that = this;

            StudentData.facebookId = event.sender.id;

            Session.put(event.sender.id, { 'authAsStudent': true });
            
            return StudentApi.put(StudentData._id, StudentData, function (response) { 

                Session.put(event.sender.id, { 'StudentData': StudentData });

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
                            "image_url": "https://static.pexels.com/photos/9660/business-money-pink-coins.jpg",
                            "buttons": [{
                                "type": "web_url",
                                "title": "Segunda Via Boleto",
                                "url": "https://upload.wikimedia.org/wikipedia/commons/c/c7/BoletoBancario.png"
                            },{
                                "type": "postback",
                                "title": "Nota Fiscal",
                                "payload": "student->nf"
                            },{
                                "type": "postback",
                                "title": "Outros",
                                "payload": "student->otherInformation"
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

        otherInformation: function (event, callback) {

            return callback({'text': 'Por favor, digite sobre o que você deseja falar.'});
        }
  
    };
};

module.exports = Student;
