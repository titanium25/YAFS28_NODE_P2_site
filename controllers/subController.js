var express = require('express');
var router = express.Router();
const passport = require('passport');
const utils = require('../lib/utils');
const moviesBL = require('../models/moviesBL');
const subsBL = require('../models/subsBL');



// Member page
router.get('/', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    const obj = utils.getPayloadFromToken(req);
    const permissions = await moviesBL.permissions(obj.sub);
    const members = await subsBL.getSubs();
    const movies = await moviesBL.getMovieList(1, await moviesBL.countMovies(), '');
    const success_msg = req.query.valid || '';
    res.render('subs', {
        members,
        movies,
        name: obj.username,
        admin: obj.isAdmin,
        permissions,
        success_msg});
});

// Add member page
router.get('/addMember', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    const obj = utils.getPayloadFromToken(req);
    const permissions = await moviesBL.permissions(obj.sub);
    const error_msg = req.query.valid || '';
    res.render('addMember', {name: obj.username, admin: obj.isAdmin, permissions, error_msg});
});

// Add member handler
router.post('/addMemberForm',async function (req, res, next) {
    const obj = utils.getPayloadFromToken(req);
    const permissions = await moviesBL.permissions(obj.sub);
    let errors = []
    const {name, email, city} = req.body;

    // Member name validation
    // Check if name is blank
    if (name){
        // Check if name is too long
        if (name.length < 18) {
            // Check if member name got numbers
            let hasNumber = /\d/;
            if (hasNumber.test(name)) errors.push({msg: 'Please dont use numbers in name field'});
        } else {
            errors.push({msg: 'Member name must be shorter than 18 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member name'});
    }

    // Member email validation
    // Check if email is blank
    if (email){
        // Check if name is too long
        if (email.length < 25) {
            // Check if email got white spaces
            // Actually done by front end
            if (utils.hasWhiteSpace(email)) errors.push({msg: 'Please dont use white spaces in email field'});
        } else {
            errors.push({msg: 'Member email must be shorter than 25 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member email'});
    }


    // Member city validation
    // Check if city is blank
    if (city){
        // Check if name is too long
        if (city.length < 12) {
            // Check if city got numbers
            let hasNumber = /\d/;
            if (hasNumber.test(city)) errors.push({msg: 'Please dont use numbers in city field'});
        } else {
            errors.push({msg: 'City must be shorter than 12 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member city'});
    }


    if (errors.length > 0) {
        res.render('addMember', {name: obj.username, admin: obj.isAdmin, permissions, errors});
    } else {
        const newMember = {name, email, city}
        await subsBL.addSub(newMember)
        const success_msg = `Member ${name} added successfully`
        res.redirect('/menu/subs?valid=' + success_msg);

    }
});

// Edit member handler
// ToDo: execute validation
router.post('/editMemberForm', async function (req, res, next) {
    const obj = utils.getPayloadFromToken(req);
    const permissions = await moviesBL.permissions(obj.sub);
    let errors = []
    const {name, email, city} = req.body;

    // Member name validation
    // Check if name is blank
    if (name){
        // Check if name is too long
        if (name.length < 18) {
            // Check if member name got numbers
            let hasNumber = /\d/;
            if (hasNumber.test(name)) errors.push({msg: 'Please dont use numbers in name field'});
        } else {
            errors.push({msg: 'Member name must be shorter than 18 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member name'});
    }

    // Member email validation
    // Check if email is blank
    if (email){
        // Check if name is too long
        if (email.length < 25) {
            // Check if email got white spaces
            // Actually done by front end
            if (utils.hasWhiteSpace(email)) errors.push({msg: 'Please dont use white spaces in email field'});
        } else {
            errors.push({msg: 'Member email must be shorter than 25 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member email'});
    }


    // Member city validation
    // Check if city is blank
    if (city){
        // Check if name is too long
        if (city.length < 12) {
            // Check if city got numbers
            let hasNumber = /\d/;
            if (hasNumber.test(city)) errors.push({msg: 'Please dont use numbers in city field'});
        } else {
            errors.push({msg: 'City must be shorter than 12 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member city'});
    }


    if (errors.length > 0) {
        const members = await subsBL.getSubs();
        res.render('subs', {members, name: obj.username, admin: obj.isAdmin, permissions, errors});
    } else {
        const success_msg = await subsBL.updateSub(req)
        res.redirect('/menu/subs/?valid=' + success_msg)
    }

});

// Delete subs handler
router.post('/deleteMemberForm', async function (req, res, next) {
    const success_msg = await subsBL.deleteSub(req);
    res.redirect('/menu/subs/?valid=' + success_msg);
});

module.exports = router;