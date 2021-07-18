var express = require('express');
var router = express.Router();
const passport = require('passport');
const utils = require('../lib/utils');
const moviesBL = require('../models/moviesBL');
// const upload = require('../lib/upload')

// ToDo: Move to separate file
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
    let page = parseInt(req.query.page) || 1;
    let size = parseInt(req.query.size) || 10;
    let find = req.query.find || '';
    const count = await moviesBL.countMovies();
    const movies = await moviesBL.getMovieList(page, size, find);
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    let success_msg = req.query.valid || '';
    res.render('movies', {
        movies,
        current: page,
        pages: Math.ceil(count / size),
        name: obj.username,
        admin: obj.isAdmin,
        permissions,
        success_msg
    });
});

// Add movie page
router.get('/addMovie', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    const genreList = await moviesBL.getGenres();
    const obj = utils.getPayloadFromToken(req);
    const permissions = await moviesBL.permissions(obj.sub);
    const error_msg = req.query.valid || '';
    res.render('addMovie', {name: obj.username, admin: obj.isAdmin, permissions, genreList, error_msg});
});

// Add movie handler
// ToDo: none jpg/png file error
router.post('/addMovieForm', upload, async function (req, res, next) {
    const genreList = await moviesBL.getGenres();
    const obj = utils.getPayloadFromToken(req);
    const permissions = await moviesBL.permissions(obj.sub);
    let errors = []
    const {title, premiered, genres} = req.body;

    // Movie title validation
    // Check if title is blank
    if (title){
        // Check if title is too long
        if (title.length > 15) errors.push({msg: 'Title must be shorter than 15 charters'});
    } else {
        errors.push({msg: 'Please fill in movie title'});
    }

    // Movie year validation
    // Check if year is blank
    if (premiered) {
        // Check if premiered string contains numbers only
        if (!isNaN(premiered)){
            // Check if premiered year not 4 characters exactly
            if (premiered.length == 4) {
                // Check if year is greater then actually date
                if (+premiered > new Date().getFullYear()) errors.push({msg: `Movie year cant be greater then ${new Date().getFullYear()}`});
                // Check if year is too old
                if (+premiered < 1900) errors.push({msg: `Movie year cant be smaller then 1900`});
                // Check if inputs got white spaces
                if (utils.hasWhiteSpace(premiered)) errors.push({msg: 'Please dont use white spaces in premiered field'});
            } else {
                errors.push({msg: 'Premiered year must be 4 digits'});
            }
        } else {
            errors.push({msg: 'Please type in year field numbers only'});
        }
    } else {
        errors.push({msg: 'Please fill in movie year'});
    }

    // Movie cover required
    if (!req.file) errors.push({msg: 'No image uploaded'});

    // Check if no genres selected
    if(!genres) errors.push({msg: 'Please choose one movie genre at least'});

    if (errors.length > 0) {
        res.render('addMovie', {name: obj.username, admin: obj.isAdmin, permissions, genreList, errors});
    } else {
        const newMovie = {
            name: title,
            genres: genres,
            image: DIR.substring(8) + '/' + req.file.filename,
            premiered: premiered
        }
        await moviesBL.addMovie(newMovie)
        const success_msg = `Movie "${req.body.title}" added successfully`
        res.redirect('/menu/movies/?valid=' + success_msg);
    }

});

// Delete movie handler
router.post('/deleteMovieForm', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    const success_msg = await moviesBL.deleteMovie(req)
    res.redirect('/menu/movies/?valid=' + success_msg);
});

// Edit movie handler
router.post('/editMovieForm', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    const success_msg = await moviesBL.updateMovie(req)
    res.redirect('/menu/movies/?valid=' + success_msg)
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