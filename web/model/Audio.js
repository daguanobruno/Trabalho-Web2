module.exports = function(){

	var db = require('../libs/db')();
	var Schema = require('mongoose').Schema;

	var Audio = Schema({
		titulo: String,
		descricao: String
	});

	return db.model('audio', Audio);
}