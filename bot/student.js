// /**
//  * Student Session
//  */
// var Student = {

//      welcome: function(recipientId, message) {

//         message = {
//             "attachment": {
//                 "type": "template",
//                 "payload": {
//                     "template_type": "generic",
//                     "elements": [{
//                         "title": "Bem vindo Cândidato",
//                         "subtitle": "Selecione uma opção",
//                         "image_url": "https://image.shutterstock.com/display_pic_with_logo/2552089/236656255/stock-photo-optical-form-of-an-examination-236656255.jpg",
//                         "buttons": [{
//                             "type": "postback",
//                             "title": "Informações Financeiras",
//                             "payload": "authStudent&StudentPaymentInformation"
//                         },{
//                             "type": "postback",
//                             "title": "Informações do Concurso",
//                             "payload": "authStudent&StudentContestInformation"
//                         },{
//                             "type": "postback",
//                             "title": "Outros",
//                             "payload": "StudentOtherInformation"
//                         }]
//                     }]
//                 }
//             }
//         };

//         sendMessage(recipientId, message);
//     },

//     auth: function(callback) {

//     },

//     paymentInformation: function() {

//     },

//     contestInformation: function () {

//     }

// };

// module.exports = Student;