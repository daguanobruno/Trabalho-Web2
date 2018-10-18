module.exports = function(){

	var db = require('../libs/db')();
	var Schema = require('mongoose').Schema;

	var Usuario = Schema({
		nome: String,
		sobrenome: String,
		email: { type: String, unique: true},
		senha1: String,
		senha2: String
	});

	return db.model('usuarios', Usuario);
}