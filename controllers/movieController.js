var express = require('express');
var router = express.Router();
const passport = require('passport');
const utils = require('../lib/utils');
const moviesBL = require('../models/moviesBL');

// Menu page
router.get('/', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('menu', {name: obj.username, admin: obj.isAdmin, permissions});
});

// Movies page
router.get('/movies', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    let movies = await moviesBL.getMovieList()
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('movies', {movies, name: obj.username, admin: obj.isAdmin, permissions});
});

// Add movie page
router.get('/', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('menu', {name: obj.username, admin: obj.isAdmin, permissions});
});

// Movies page
router.post('/movies', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    let movies = await moviesBL.findMovie(req)
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('movies', {movies, name: obj.username, admin: obj.isAdmin, permissions});
});

// Logout Handle
router.get('/logout', function(req, res, next) {
    // There is no way to destroy JWT token. To logout you need to expired cookie manually
    res.cookie('jwt', {expires: Date.now()});
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

module.exports = router;