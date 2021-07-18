var express = require('express');
var router = express.Router();
const passport = require('passport');
const utils = require('../lib/utils');
const moviesBL = require('../models/moviesBL');
const subsBL = require('../models/subsBL');

// Subs page
router.get('/', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    let obj = utils.getPayloadFromToken(req);
    let permissions = await moviesBL.permissions(obj.sub);
    const members = await subsBL.getSubs();
    res.render('subs', {members, name: obj.username, admin: obj.isAdmin, permissions});
});


module.exports = router;