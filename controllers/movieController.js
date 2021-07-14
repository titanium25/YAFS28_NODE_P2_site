var express = require('express');
var router = express.Router();
const passport = require('passport');
const utils = require('../lib/utils');
const moviesBL = require('../models/moviesBL');

// File upload
const path = require('path');
const pathToStore = path.join(__dirname, '..', 'uploads');
const uuid = require('uuid')
const multer  = require('multer')

//Set Storage Engine
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname, '..', 'uploads')      //you tell where to upload the files,
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.png')
    }
})

var upload = multer({storage: storage,
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
});
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, '../uploads')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// })

// const upload = multer({ dest: 'uploads/' })
// const upload = require('../lib/uploads')

// const multer  = require('multer')
//
//
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, pathToStore)
//     },
//     filename: function (req, file, cb) {
//         cb(null, uuid.v4() + path.extname(file.originalname));
//     }
// })

// const upload = multer({ storage: storage })

// Menu page
router.get('/', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('menu', {name: obj.username, admin: obj.isAdmin, permissions});
});

// Movies page
router.get('/movies', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    let movies = await moviesBL.getMovieList();
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('movies', {movies, name: obj.username, admin: obj.isAdmin, permissions});
});

// Add movie page
router.get('/addMovie', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    let genreList = await moviesBL.getGenres();

    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('addMovie', {name: obj.username, admin: obj.isAdmin, permissions, genreList});
});

// Add movie handler
router.post('/addMovieForm', upload.single('myImage'), passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    // let genreList = await moviesBL.getGenres();
    // let obj = utils.getPayloadFromToken(req);
    // let permissions = await moviesBL.permissions(obj.sub);
    //

    // const file = req.files.file
    // const fileName = uuid.v4() + file.name
    // file.mv(`${pathToStore}/${fileName}`)
    console.log(req.file)


    // var upload = multer({ storage: storage, limits: { fileSize: 100000000 } }).single('myImage');
    // // req.file is the `myImage` file
    // upload(req, res, function (err) {
    //     console.log(res.file);
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log("hello" + storage);
    //         res.send("test");
    //     }
    // })
});



// Search for movies handler
router.post('/movies', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    let movies = await moviesBL.findMovie(req)
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('movies', {movies, name: obj.username, admin: obj.isAdmin, permissions});
});

// Logout Handle
router.get('/logout', function (req, res, next) {
    // There is no way to destroy JWT token. To logout you need to expired cookie manually
    res.cookie('jwt', {expires: Date.now()});
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

module.exports = router;