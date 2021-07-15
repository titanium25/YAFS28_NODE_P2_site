var express = require('express');
var router = express.Router();
const passport = require('passport');
const utils = require('../lib/utils');
const moviesBL = require('../models/moviesBL');

// File upload
// const path = require('path');
// const pathToStore = path.join(__dirname, '..', 'uploads');
const uuid = require('uuid')
const multer  = require('multer')
const DIR = './uploads';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = uuid.v4().toString() + '.' + file.mimetype.split('/').reverse()[0];
        cb(null, fileName)
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024 // for 2MB
    }
}).single('myImage');


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
    res.render('addMovie', {name: obj.username, admin: obj.isAdmin, permissions, genreList, message: undefined});
});

// Add movie handler
router.post('/addMovieForm', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    upload(req, res, async function (err) {
        if (err) {
            let genreList = await moviesBL.getGenres();

            let obj = utils.getPayloadFromToken(req);
            let permissions = await moviesBL.permissions(obj.sub);
            res.render('addMovie', {name: obj.username, admin: obj.isAdmin, permissions, genreList, error_msg: err});

        } else {
            let genreList = await moviesBL.getGenres();

            let obj = utils.getPayloadFromToken(req);
            let permissions = await moviesBL.permissions(obj.sub);
            const success_msg = 'You new avatar is uploaded'
            res.render('addMovie', {name: obj.username, admin: obj.isAdmin, permissions, genreList, success_msg});
        }

        // Everything went fine
    })
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