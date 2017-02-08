// Dependencies
var mongoose = require('mongoose');

// Schema
var messageSchema = new mongoose.Schema({
	facebookId: String,
	message: Object,
	sendDate: Date,
	registerData: Date
});

// Return model
module.exports = mongoose.model('Message', messageSchema);