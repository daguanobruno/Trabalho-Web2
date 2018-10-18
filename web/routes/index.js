var express = require('express');
var router = express.Router();

var GridFsStorage = require('multer-gridfs-storage');
var crypto = require('crypto');
var path = require('path');
var multer = require('multer');


var mongoURL = 'mongodb://localhost/trabalhoWeb-versaoFinal3';



var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 
var fs = require('fs');
 
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;

const model = require('../model/usuario')();
const model2 = require('../model/audio')();


const mongoURI = 'mongodb://localhost/trabalhoWeb-versaoFinal3';
var conn = mongoose.createConnection(mongoURI);

const { Readable } = require('stream');

let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
    let body = req.body;


    console.log(body);


    body.status = false;

    model2.create(body, function(err, audio){
        if(err)
            throw err;
        res.redirect('/listar');
      });  
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Pagina Inicial' });
});

router.get('/register', function(req, res, next) {
  res.render('cadastro');
});

router.post('/cadastrar', function(req, res, next){
    let body = req.body;

    /*req.assert('nome','Nome Obrigatório').notEmpty();
    req.assert('sobrenome','Sobrenome Obrigatório').notEmpty();
    req.assert('email','Email Obrigatótio').notEmpty();
    req.assert('senha1','Senha Obrigatória').notEmpty();
    req.assert('senha1','Senha deve conter entre 5 à 20 caracteres').len(5,10);
    req.assert('senha2','Senha Obrigatória').notEmpty();

    var erros = req.validationErrors();*/
    console.log(body);

/*
    if(erros){
        res.render('cadastro', {validacao : erros});
        return;
    }
*/
    body.status = false;

    model.create(body, function(err, usuario){
        if(err)
            throw err;
        res.redirect('/');
    })
});


router.get('/listar', async (req, res) => {
  const audio = await model2.find();
  const files = await gfs.files.find().toArray();
//  const files = await gfs.files.find().toArray();

  res.render('logado', {
    audio, files
  });
});

/*
router.get('/listar', (req, res) => {
          gfs.files.find().toArray((err, files) => {
            // Check if files
            if (!files || files.length === 0) {
              res.render('feed', { files: false, username: user.username });
            } else {
              files.map(file => {
                if (file.contentType === 'mp3' ) {
                  console.log("Tem video");
                } else {
                  console.log("Arquivo não é video");
                }
              });
            res.render('logado', { files: files});
            }
          });
        });
*/

router.get('/listar/:filename', (req, res) => {
   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    if (file.contentType === 'audio/mp3') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      }else {
        res.status(404).json({
          err: 'Not an video'
        });
      }
  });
});
 
router.get('/cadastrarAudio', function(req, res, next) {
    res.render('cadastrarAudio');
});





/*let body = req.body;


    console.log(body);


    body.status = false;

    model2.create(body, function(err, audio){
        if(err)
            throw err;
        res.redirect('/listar');
    })*/

/*
router.get('/alterar', async (req, res, next) => {
  // const audio = await model2.findById(req.params.id);
  //res.redirect('/alterarAudio', { audio });
          res.redirect('/a');

});
*//*
router.get('/alterar', async (req, res, next) => {
    // const audio = await model2.findById(req.params.id);
  //res.redirect('/alterarAudio', { audio });
    res.render('a');
});*/

router.get('/edit/:id', async (req, res, next) => {
  const audio1 = await model2.findById(req.params.id);
  console.log(audio1)
  res.render('alterarAudio', { audio1 });
});

router.post('/edit/:id', async (req, res, next) => {
  const { id } = req.params;
  await model2.update({_id: id}, req.body);
  res.redirect('/listar');
});
/*
router.get('/deletar/:id', async (req, res, next) => {
  let { id } = req.params;
  const files = await gfs.files.find();
//  await model2.remove({_id: id});
  files.delete({_id: id, root: 'uploads'});
  res.redirect('/listar');
});
*/
router.post('/deletar/:id', async (req, res) => {
  const files = await gfs.files.find().toArray();

  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      res.redirect('/');
      }

    res.redirect('/listar');  
    });
});


module.exports = router;
