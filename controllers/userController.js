var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const passport = require('passport');

const utils = require('../lib/utils');
const usersBL = require('../models/usersBL')


// Users Console
router.get('/', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    let obj = utils.getPayloadFromToken(req)
    let userList = await usersBL.getAllUsers();
    res.render('manageUsers', {userList, name: obj.username, admin: obj.isAdmin});
});

// Add User
router.get('/addUser', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    let obj = utils.getPayloadFromToken(req)
    res.render('addUser', {name: obj.username});
});

// Add User Handler
router.post('/addUserForm', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    // Pull data from the front end form
    const {firstName, lastName, username, timeOut, email} = req.body;

    let errors = [];

    // Check required fields not blank
    if (!firstName || !lastName || !username || !timeOut) {
        errors.push({msg: 'Please dont leave blank fields'});
    }
    // Check if username is unique
    let searchForUserInDB = await User.find({username})
    if (searchForUserInDB.length > 0) {
        errors.push({msg: 'This username is already exists'});
    }

    // Check if email is unique
    let searchForEmailInDB = await User.find({email})
    if (searchForEmailInDB.length > 0) {
        errors.push({msg: 'This email is already exists'});
    }

    // Check if inputs got white spaces
    if (utils.hasWhiteSpace(username) ||
        utils.hasWhiteSpace(firstName) ||
        utils.hasWhiteSpace(lastName) ||
        utils.hasWhiteSpace(email) ) {
        errors.push({msg: 'Please dont use white spaces in inputs'});
    }

    // Check if inputs got numbers
    let hasNumber = /\d/;
    if (hasNumber.test(firstName) || hasNumber.test(lastName)) {
        errors.push({msg: 'Please dont use numbers in name fields'});
    }
    // Check if values too long
    if (username.length > 18 || firstName.length > 18 || lastName.length > 18) {
        errors.push({msg: 'Inputs must be shorter than 18 charters'});
    }

    // Check if email is too long
    if (email.length > 30) {
        errors.push({msg: 'Email must be shorter than 30 charters'});
    }

    if (errors.length > 0) {
        res.render('addUser', {errors})
    } else {
        await usersBL.addUser(req);
        req.flash('success_msg', `New user ${req.body.username} added successfully`);
        res.redirect('/menu/manage');
    }

});

// Edit User Handler
router.post('/editUserForm', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    let errors = await usersBL.updateUser(req);
    if (typeof errors != 'undefined') {
        let userList = await usersBL.getAllUsers();
        res.render('manageUsers', {userList, errors})
    } else {
        req.flash('success_msg', `User ${req.body.username} edited successfully`);
        res.redirect('/menu/manage');
    }

});

// Delete User Handler
router.post('/deleteUserForm', passport.authenticate('jwt', { session: false }), async function (req, res, next) {
    await usersBL.deleteUser(req.body.userId);
    req.flash('success_msg', `User ${req.body.username} deleted successfully`);
    res.redirect('/menu/manage');
});

module.exports = router;