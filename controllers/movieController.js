var express = require('express');
var router = express.Router();
const passport = require('passport');
const utils = require('../lib/utils');
const moviesBL = require('../models/moviesBL');

// Menu page
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let obj = utils.getPayloadFromToken(req);
    res.render('menu', {name: obj.username});
});

// Movies page
router.get('/movies', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let movies = moviesBL.getMovies();
    console.log(movies)
    let obj = utils.getPayloadFromToken(req);
    res.render('movies', {movies, name: obj.username});
});

// Logout Handle
router.get('/logout', function(req, res, next) {
    // There is no way to destroy JWT token. To logout you need to expired cookie manually
    res.cookie('jwt', {expires: Date.now()});
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

module.exports = router;