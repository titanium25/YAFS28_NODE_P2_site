var express = require('express');
var router = express.Router();
const passport = require('passport');
const utils = require('../lib/utils');
const moviesBL = require('../models/BL/moviesBL');
const membersBL = require('../models/BL/membersBL');
const subsBL = require('../models/BL/subsBL');

// Member page
router.get('/', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    let find = req.query.find || '';
    const obj = utils.getPayloadFromToken(req);
    const permissions = await moviesBL.permissions(obj.sub);
    const members = await membersBL.getMembers(find);
    const moviesDropDownList = await moviesBL.getMovies(1, await moviesBL.countMovies(), '');
    const success_msg = req.query.valid || '';

    res.render('subs', {
        members,
        movies: moviesDropDownList,
        name: obj.username,
        admin: obj.isAdmin,
        permissions,
        success_msg});
});

// Add sub handler
router.post('/addSubscription',async function (req, res, next) {
    const {memberId, movieId, date} = req.body
    const obj = {memberId, movieId, date}
    await subsBL.addSubs(obj)
    res.redirect('/menu/subs/')
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
        if (name.length < 25) {
            // Check if member name got numbers
            let hasNumber = /\d/;
            if (hasNumber.test(name)) errors.push({msg: 'Please dont use numbers in name field'});
        } else {
            errors.push({msg: 'Member name must be shorter than 25 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member name'});
    }

    // Email validation
    // Check if email is blank
    if (email){
        // Check if name is too long
        if (email.length < 35) {
            // Check if email got white spaces
            // Actually done by front end
            if (utils.hasWhiteSpace(email)) errors.push({msg: 'Please dont use white spaces in email field'});
        } else {
            errors.push({msg: 'Email must be shorter than 35 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member email'});
    }


    // City validation
    // Check if city is blank
    if (city){
        // Check if name is too long
        if (city.length < 20) {
            // Check if city got numbers
            let hasNumber = /\d/;
            if (hasNumber.test(city)) errors.push({msg: 'Please dont use numbers in city field'});
        } else {
            errors.push({msg: 'City must be shorter than 20 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member city'});
    }


    if (errors.length > 0) {
        res.render('addMember', {name: obj.username, admin: obj.isAdmin, permissions, errors});
    } else {
        const obj = {name, email, city}
        await membersBL.addMember(obj)
        const success_msg = `Member ${name} added successfully`
        res.redirect('/menu/subs?valid=' + success_msg);
    }
});

// Edit member handler
router.post('/editMemberForm', async function (req, res, next) {
    const obj = utils.getPayloadFromToken(req);
    const permissions = await moviesBL.permissions(obj.sub);
    let errors = []
    const {name, email, city} = req.body;

    // Member name validation
    // Check if name is blank
    if (name){
        // Check if name is too long
        if (name.length < 25) {
            // Check if member name got numbers
            let hasNumber = /\d/;
            if (hasNumber.test(name)) errors.push({msg: 'Please dont use numbers in name field'});
        } else {
            errors.push({msg: 'Member name must be shorter than 25 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member name'});
    }

    // Member email validation
    // Check if email is blank
    if (email){
        // Check if name is too long
        if (email.length < 35) {
            // Check if email got white spaces
            // Actually done by front end
            if (utils.hasWhiteSpace(email)) errors.push({msg: 'Please dont use white spaces in email field'});
        } else {
            errors.push({msg: 'Email must be shorter than 35 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member email'});
    }


    // City validation
    // Check if city is blank
    if (city){
        // Check if name is too long
        if (city.length < 20) {
            // Check if city got numbers
            let hasNumber = /\d/;
            if (hasNumber.test(city)) errors.push({msg: 'Please dont use numbers in city field'});
        } else {
            errors.push({msg: 'City must be shorter than 0 charters'});
        }
    } else {
        errors.push({msg: 'Please fill in member city'});
    }


    if (errors.length > 0) {
        const members = await membersBL.getMembers();
        res.render('subs', {members, name: obj.username, admin: obj.isAdmin, permissions, errors});
    } else {
        const success_msg = await membersBL.updateMember(req)
        res.redirect('/menu/subs/?valid=' + success_msg)
    }

});

// Delete member and sub handler
router.post('/deleteMemberForm', async function (req, res, next) {
    const memberId = req.body.memberId
    const memberName = req.body.memberName
    await membersBL.deleteMemberAndSub(memberId)
    res.redirect('/menu/subs/?valid=' + `Member "${memberName}" deleted successfully`);
});

module.exports = router;