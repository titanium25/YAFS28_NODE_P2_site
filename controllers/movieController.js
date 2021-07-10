var express = require('express');
var router = express.Router();
const passport = require('passport');
const utils = require('../lib/utils');

// Menu page
router.get('/', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let obj = utils.getPayloadFromToken(req)
    res.render('menu', {name: obj.username});
});

// Logout Handle
router.get('/logout', function(req, res, next) {
    // There is no way to destroy JWT token. To logout you need to expired cookie manually
    res.cookie('jwt', {expires: Date.now()});
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

module.exports = router;