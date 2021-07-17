var express = require('express');
var router = express.Router();
const passport = require('passport');
const utils = require('../lib/utils');
const moviesBL = require('../models/moviesBL');
// const upload = require('../lib/upload')

const uuid = require('uuid')
const multer = require('multer')
const DIR = './public/img/uploads';
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
    const movies = await moviesBL.getMovieList();
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    let success_msg = req.query.valid;
    if (success_msg === undefined) success_msg = ''
    res.render('movies', {movies, name: obj.username, admin: obj.isAdmin, permissions, success_msg});
});

// Add movie page
router.get('/addMovie', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    let genreList = await moviesBL.getGenres();
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);

    let error_msg = req.query.valid;
    if (error_msg === undefined) error_msg = ''

    res.render('addMovie', {name: obj.username, admin: obj.isAdmin, permissions, genreList, error_msg});
});


// Add movie handler
// ToDo: Form validation
// ToDo: Premiered required. if blank - the movie page will not render because of .substring()
router.post('/addMovieForm', passport.authenticate('jwt', {session: false}), async function (req, res, next) {


        // Check if inputs got white spaces
        // if (utils.hasWhiteSpace(req.body.premiered)) {
        //     errors.push({msg: 'Please dont use white spaces in premiered field'});
        // }
        // Check if title is too long
        // if (req.body.title.length > 15) {
        //     errors.push({msg: 'Title must be shorter than 15 charters'});
        // }
        // Check if premiered year not 4 characters exactly
        // if (req.body.premiered.length !== 4) {
        //     errors.push({msg: 'Premiered year must be 4 numbers'});
        // }
        // ToDo: Check if premiered year is between logical years
        // if (req.body.premiered > '2040' && req.body.premiered < '1900' ) {
        //     errors.push({msg: 'Premiered year must be 4 numbers'});
        // }


        upload(req, res, async function (err) {
                if (err) {
                    res.redirect('/menu/addMovie/?valid=' + err);
                } else {
                    let genreList = await moviesBL.getGenres();
                    let obj = utils.getPayloadFromToken(req);
                    let permissions = await moviesBL.permissions(obj.sub);
                    let errors = []
                    let {title, premiered, genres, myImage} = req.body;

                    // Check if title is blank
                    if (!title) {
                        errors.push({msg: 'Please fill in movie title'});
                    }
                    // Check if year is blank
                    if (!premiered) {
                        errors.push({msg: 'Please fill in movie year'});
                    }
                    // Check if premiered string contains numbers only
                    if (isNaN(premiered)) {
                        errors.push({msg: 'Please type in premiered field numbers only'});
                    }
                    //
                    if (typeof req.files !== undefined) {
                        errors.push({msg: 'no image uploaded'});
                    }
                    if (errors.length > 0) {
                        res.render('addMovie', {name: obj.username, admin: obj.isAdmin, permissions, genreList, errors});
                    } else {
                        const newMovie = {
                            name: req.body.title,
                            genres: req.body.genres,
                            image: req.file.filename === undefined ? '' : DIR.substring(8) + '/' + req.file.filename,
                            premiered: req.body.premiered
                        }
                        await moviesBL.addMovie(newMovie)
                        const success_msg = `Movie ${req.body.title} added successfully`
                        res.redirect('/menu/movies/?valid=' + success_msg);
                    }
                }
            }
        )
    }
);

// Delete movie handler
router.post('/deleteMovieForm', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    const success_msg = await moviesBL.deleteMovie(req)
    res.redirect('/menu/movies/?valid=' + success_msg);
});

// Search for movies handler
router.post('/movies', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    let movies = await moviesBL.findMovie(req)
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);

    res.render('movies', {movies, name: obj.username, admin: obj.isAdmin, permissions});
});

// Logout Handle
// ToDo: not belong in here
router.get('/logout', function (req, res, next) {
    // There is no way to destroy JWT token.
    // To logout you need to expired cookie manually
    res.cookie('jwt', {expires: Date.now()});
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

module.exports = router;