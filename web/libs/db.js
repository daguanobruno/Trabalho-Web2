const mongoose = require('mongoose');
let db;

module.exports = function Connnection(){
	if(!db){
		db = mongoose.createConnection('mongodb://localhost/trabalhoWeb-versaoFinal3');
		useMongoClient: true
	}

	return db;
}


