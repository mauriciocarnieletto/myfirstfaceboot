'use strict'

var subscriptionOfferApi = require('../../api/subscriptionoffer.js')();
var candidateApi    = require('../../api/candidate.js')();
var Session       = require('../../helpers/session.js')();

/**
 * Subscription Session
 */
function Subscription (event) {

    var that = this; 

    return {

        new: function(event, callback) {

            this.putFacebookDataOnSubscriptionData(event, function () {

                return callback({
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Quero ser um Aluno Opet :)",
                                "subtitle": "Selecione a modalidade que deseja cursar.",
                                "buttons": [{
                                    "type": "postback",
                                    "title": "Ensino Superior",
                                    "payload": "subscribe->subscribeSuperiorDegree"
                                },{
                                    "type": "postback",
                                    "title": "Pós-Graduação",
                                    "payload": "subscribe->subscribePostDegree"
                                }]
                            }]
                        }
                    }
                });
            });

        },

        putFacebookDataOnSubscriptionData: function (event, callback) {

            Session.get(event.sender.id, function(data) {

                var gender = (data.facebookData.gender === 'male') 
                                    ? 'Masculino' 
                                    : (data.facebookData.gender === 'female') 
                                        ? 'Feminino' 
                                        : data.facebookData.gender; 

                Session.put(event.sender.id, 
                    { 
                        'SubscriptionForm': {
                            'facebookId': event.sender.id,
                            'name': data.facebookData.first_name + ' ' + data.facebookData.last_name,
                            'gender': gender,
                            'profileImage': data.facebookData.profile_pic
                        } 
                    }
                );

            });

            return callback();
        },

        subscribeSuperiorDegree: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkCourse" }});

            return callback({ 'text': 'Digite o nome do curso que você deseja se inscrever.' });
        },

        subscribePostDegree: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkCourse" }});

            return callback({ 'text': 'Digite o nome do curso que você deseja se inscrever.' });
        },


        checkCourse: function (event, callback) {

            var that = this;

            subscriptionOfferApi.getByName(event.message.text, function(response) {
                response = JSON.parse(response);
                if(!response[0]) {

                    text = "Não encontrei este curso :( Digite novamente! (Dica: utilize palavras chave, como \"Administração\", \"Direito\")";
                    
                    return callback({ 'text': text });
                }
                //TODO 
                // } else if (response.length) {

                // }

                Session.put(event.sender.id, { 'SubscriptionForm': { 'course': response[0] } });

                return that.askShift(event, callback);
            });

        },

        askName: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkName" }});

            return callback({ 'text': 'Qual é o seu nome completo?' });
        },

        checkName: function (event, callback) {

            Session.put(event.sender.id, { 'SubscriptionForm': { 'name': event.message.text } });
            
            return this.askTrainee(event, callback);
        },

        askGender: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkGender" }});

            return callback({ 'text': 'Digite o nome do curso que você deseja se inscrever :P' });
        },

        checkGender: function (event, callback) {

            Session.put(event.sender.id, { 'SubscriptionForm': { 'gender': event.message.text } });
            
            return this.askTrainee(event, callback);
        },


        askShift: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkShift" }});

            return callback({ 'text': 'Ótima escolha! Você deseja cursar pela no turno da manhã ou noturno?' });
        },

        checkShift: function (event, callback) {

            var that = this;
            var shift = '';

            switch (event.message.text) {
                case 'Noite':
                case 'noite':
                case 'Noturno':
                case 'noturno':
                    shift = 'N';
                break;
                case 'manhã':
                case 'Manhã':
                case 'matinal':
                case 'Matinal':
                case 'Diurno':
                case 'diurno':
                    shift = 'M';
                break;
                default:
                    Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkShift" }});
                    return callback({ 'text': 'Desculpe, não entendi. Você deseja cursar pela no turno da manhã ou noturno?' });
                break;
            }

            Session.put(event.sender.id, { 'SubscriptionForm': { 'shift': shift } });

            return that.askCpf(event, callback);

        },

        askCpf: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkCpf" }});

            return callback({ 'text': 'Estamos quase lá! \nDigite seu cpf com pontuação.' });            
        },

        checkCpf: function (event, callback) {

            var that = this;

            if(!event.message.text.match(/^([0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2})$/) 
                || !this.validateCpf(event.message.text.replace(/\./g, '').replace('-', ''))
            ) {

                Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkCpf" }});

                return callback({ 'text': 'O que você digitou não parece válido. Por favor, digite seu CPF novamente.' }); 
            }

            candidateApi.get({ 'cpf': event.message.text }, function(response) {
                response = JSON.parse(response);
                if(!response[0]) {
    
                    Session.put(event.sender.id, { 'SubscriptionForm': { 'cpf': event.message.text } });

                    return that.askPassword(event, callback);
                }

                Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkExistentCpfAnswer" }});

                return callback({ 'text': 'Já encontrei um candidato com este cpf, deseja atualizar sua inscrição? Digite "Sim" ou "Não"' });    
            });
        },

        validateCpf: function (cpf) {

            var sum = 0;
            var rest;

            if(cpf == '00000000000') return false;

            for(var i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);

            rest = (sum * 10) % 11;

            if((rest == 10) || (rest == 11)) rest = 0;

            if(rest != parseInt(cpf.substring(9, 10))) return false;

            sum = 0;

            for(i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i-1, i))*(12-i);

            rest = (sum * 10) % 11;

            if((rest == 10) || (rest == 11)) rest = 0;

            if(rest != parseInt(cpf.substring(10, 11))) return false;
            return true;
        },

        checkExistentCpfAnswer: function (event, callback) {

            if(event.message.text === "Sim" || event.message.text === "sim" || event.message.text === "quero" || event.message.text === "Quero") {

                Session.put(event.sender.id, { 'SubscriptionForm': { 'updateSubscription': true } });

                return this.askCandidatebirthDate(event, callback);
            }
            
            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkBirthDate" }});

            return callback({ 'text': 'Então vamos gerar uma nova inscrição, ok? Digite sua data de nascimento' });
        },

        askPassword: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkPassword" }});

            return callback({ 'text': 'Crie uma senha de acesso para nosso portal de relacionamento.' });            
        },

        checkPassword: function (event, callback) {

           
            Session.put(event.sender.id, { 'SubscriptionForm': { 'password': event.message.text } });

            return this.askPhone(event, callback);

        },

        askPhone: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkPhone" }});

            return callback({ 'text': 'Digite seu celular \n Dica: Digite ele no formato (99) 99999-9999' });            
        },

        checkPhone: function (event, callback) {

           if(!event.message.text.match(/^\([1-9]{2}\) [2-9][0-9]{3,4}\-[0-9]{4}$/)) {
    
                Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkPhone" }});
                return callback({ 'text': 'O formato que você digitou parece errado. Tente novamente seguindo o formato dd/mm/aaaa' });  

            }

            Session.put(event.sender.id, { 'SubscriptionForm': { 'mobilePhone': event.message.text } });

            return this.askBirthDate(event, callback);

        },

        askBirthDate: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkBirthDate" }});

            return callback({ 'text': 'Qual é a sua data de nascimento? (Digite no formato DD/MM/AAAA)' });   
        },

        checkBirthDate: function (event, callback) {

            if(!event.message.text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)) {
    
                Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkBirthDate" }});
                return callback({ 'text': 'O formato que você digitou parece errado. Tente novamente seguindo o formato dd/mm/aaaa' });  

            } else {

                var birthDate = new Date(event.message.text.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
                var age = Date.now() - birthDate.getTime();

                if(age < 18) {

                    return callback({ 'text': 'Você é menor de idade, antes da prova, iremos entrar em contato telefônico para cadastrar seu responsável, tudo bem? ;)' });  
                }

                Session.put(event.sender.id, { 'SubscriptionForm': { 'birthDate': birthDate } });

                return this.askSpecialNeeds(event, callback);
            }
        },

        askSpecialNeeds: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkSpecialNeeds" }});
            return callback({ 'text': 'Você possui alguma necessidade especial? (problemas de visão/audição/canhoto/etc...)' });  
        },

        checkSpecialNeeds: function (event, callback) {

            Session.put(event.sender.id, { 'SubscriptionForm': { 'specialNeeds': event.message.text } });
            
            return this.askTrainee(event, callback);
        },

        askTrainee: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkTrainee" }});
            return callback({ 'text': 'Para finalizar, você vai prestar o vestibular como traineiro?' });
        },

        checkTrainee: function (event, callback) {

            Session.put(event.sender.id, { 'SubscriptionForm': { 'trainee': event.message.text } });

            return this.askConfirmSubscription(event, callback);
        },


        askConfirmSubscription: function (event, callback) {

            Session.get(event.sender.id, function (data) {
                console.log(data);

                var textConfirmation  = 'Nome: '                    + data.SubscriptionForm.name + ' \n';
                    textConfirmation += 'CPF: '                     + data.SubscriptionForm.cpf + ' \n';
                    textConfirmation += 'Senha: '                   + data.SubscriptionForm.password + ' \n';
                    textConfirmation += 'Data de Nascimento: '      + data.SubscriptionForm.birthDate.toLocaleDateString("latn") + ' \n';
                    textConfirmation += 'Celular: '                 + data.SubscriptionForm.mobilePhone + ' \n';
                    textConfirmation += 'Necessidades Especiais: '  + data.SubscriptionForm.specialNeeds + ' \n';
                    textConfirmation += 'Traineiro: '               + data.SubscriptionForm.trainee + ' \n';
                    textConfirmation += 'Sexo: '                    + data.SubscriptionForm.gender + ' \n';
                    textConfirmation += 'Curso: '                   + data.SubscriptionForm.course.name + ' \n';
                    textConfirmation += 'Turno: '                   + data.SubscriptionForm.shift + ' \n';

                Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});

                return callback({ 'text': 'Você confirma os dados abaixo? Se sim, digite "Sim", se não, digite o nome do atributo que deseja alterar. \n\n' + textConfirmation });
            });

        },

        askFieldCorrection: function (event, callback) {

            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});

            return callback({ 'text': 'Você confirma os dados abaixo? \n Digite "sim" ou digite o nome do campo que deseja corrigir. \n\n' + textConfirmation });
        },

        checkConfirmSubscription: function (event, callback) {

            var that = this;

            Session.get(event.sender.id, function (data) {

                if(data.correctingSubscriptionFieldPostBack) {

                    var checkMessage = data.correctingSubscriptionFieldPostBack;
    
                    if(typeof that[checkMessage] === "function") {
                      
                        that[checkMessage](event, function (message) {

                            Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': false });

                            return that.askConfirmSubscription(event, callback);
                        });
                    }

                }

                switch (event.message.text) {
                    case 'Sim':
                    case 'sim':
                        return that.storeCandidateFacebookData(event, callback);
                    break;
                    case 'Não':
                    case 'não':
                        return that.askFieldCorrection(event, callback);
                    break;
                    case 'Nome':
                    case 'nome':
                        Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': 'checkName' });
                        return that.askName(event, function (message) {

                            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});
                            return callback(message);
                        });
                    break;
                    case 'CPF':
                    case 'cpf':
                        Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': 'checkCpf' });
                        return that.askCPF(event, function (message) {

                            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});
                            return callback(message);
                        });
                    break;
                    case 'Senha':
                    case 'senha':
                        Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': 'checkPassword' });
                        return that.askPassword(event, function (message) {

                            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});
                            return callback(message);
                        });
                    break;
                    case 'celular':
                    case 'Celular':
                    case 'telefone':
                    case 'Telefone':
                        Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': 'checkPhone' });
                        return that.askPhone(event, function (message) {

                            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});
                            return callback(message);
                        });
                    break;
                    case 'Data Nascimento':
                    case 'data dascimento':
                        Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': 'checkBirthDate' });
                        return that.askBirthDate(event, function (message) {
                            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});
                            return callback(message);
                        });
                    break;
                    case 'Necessidades Especiais':
                    case 'necessidades especiais':
                        Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': 'checkSpecialNeeds' });
                        return that.askSpecialNeeds(event, function (message) {
                            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});
                            return callback(message);
                        });
                    break;
                    case 'Trainee':
                    case 'trainee':
                        Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': 'checkSpecialNeeds' });
                        return that.askTrainee(event, function (message) {
                            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});
                            return callback(message);
                        });
                    break;
                    case 'Sexo':
                    case 'sexo':
                        Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': 'checkGender' });
                        return that.askGender(event, function (message) {
                            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});
                            return callback(message);
                        });
                    break;
                    case 'Curso':
                    case 'curso':
                        Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': 'checkCourse' });
                        return that.subscribeSuperiorDegree(event, function (message) {
                            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});
                            return callback(message);
                        });
                    break;
                    case 'Turno':
                    case 'turno':
                        Session.put(event.sender.id, { 'correctingSubscriptionFieldPostBack': 'checkShift' });
                        return that.askShift(event, function (message) {
                            Session.put(event.sender.id, { 'nextPostback': { 'payload': "subscribe->checkConfirmSubscription" }});
                            return callback(message);
                        });
                    break;
                    default:

                    break;
                }

            });

        }, 

        storeCandidateFacebookData: function (event, callback) {

            var that = this;

            Session.get(event.sender.id, function (data) {

                candidateApi.getNewId(function (newId) {

                    var candidateData = {
                        "id": newId, 
                        "name": data.SubscriptionForm.name ,
                        "cpf": data.SubscriptionForm.cpf ,
                        "password": data.SubscriptionForm.password,
                        "birthDate": data.SubscriptionForm.birthDate,
                        "specialNeeds": data.SubscriptionForm.specialNeeds ,     
                        "trainee": data.SubscriptionForm.trainee,        
                        "gender": data.SubscriptionForm.gender,
                        "status": "New",
                        "mobilePhone": data.SubscriptionForm.mobilePhone,
                        "profileImage": data.SubscriptionForm.profileImage,
                        "course": data.SubscriptionForm.course,
                        "shift": data.SubscriptionForm.shift ,
                        "facebookId": event.sender.id,
                        "lastBotStatus": {}

                    };

                    candidateApi.post(candidateData, function (response) {

                        Session.put(event.sender.id, { 'candidateData': candidateData, 'authAsCandidate': true });

                        Session.put(event.sender.id, { 'nextPostback': { 'payload': "candidate->welcomeMenu" }});

                        return callback({ 'text': 'Parabéns! Você está um passo mais próximo de se tornar um aluno Opet! :D \nVocê se inscreveu em nosso processo seletivo com sucesso! \nSeu código de candidato é ' + candidateData.id + ', sempre que precisar entrar em contato com nossa instituição, tenha-o em mãos, ok? \n\n Me diga, como foi sua experiência até agora?' });
                    });
                });
            });
        },
    };
};

module.exports = Subscription;
