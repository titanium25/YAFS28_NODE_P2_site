var express = require('express');
var router = express.Router();
const User = require('../models/dbModels/userModel');
const passport = require('passport');

const utils = require('../lib/utils');
const usersBL = require('../models/BL/usersBL')
const moviesBL = require('../models/BL/moviesBL');


// Users Console
router.get('/', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    let obj = utils.getPayloadFromToken(req)
    let userList = await usersBL.getAllUsers();
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('manageUsers', {userList, name: obj.username, admin: obj.isAdmin, permissions});
});

// Add User
router.get('/addUser', passport.authenticate('jwt', {session: false}), async function (req, res, next) {
    let obj = utils.getPayloadFromToken(req)
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('addUser', {name: obj.username, admin: obj.isAdmin, permissions});
});

// Add User Handler
router.post('/addUserForm', async function (req, res, next) {
    // Pull data from the front end form
    const {firstName, lastName, username, timeOut, email} = req.body;
    let obj = utils.getPayloadFromToken(req)
    let errors = []

    console.log(req.body.vm)

    // Check required fields not blank
    if (!firstName || !lastName || !username || !timeOut || !email) {
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
        utils.hasWhiteSpace(email)) {
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
        let permissions = await moviesBL.permissions(obj.sub);
        res.render('addUser', {errors, name: obj.username, admin: obj.isAdmin, permissions})
    } else {
        await usersBL.addUser(req);
        let success = []
        success.push({msg: `New user ${req.body.username} added successfully`})
        let userList = await usersBL.getAllUsers();
        let permissions = await moviesBL.permissions(obj.sub);
        res.render('manageUsers', {userList, success, name: obj.username, admin: obj.isAdmin, permissions});
    }

});

// Edit User Handler
router.post('/editUserForm', async function (req, res, next) {

    // Pull data from the front end form
    const {firstName, lastName, username, timeOut} = req.body

    let obj = utils.getPayloadFromToken(req)
    let userList = await usersBL.getAllUsers();

    let errors = [];

    // Check required fields not blank
    if (!firstName || !lastName || !username || !timeOut) {
        errors.push({msg: 'Please dont leave blank fields'});
    }
    // Check if username is unique
    // let searchForUserInDB = await User.find({username})
    // if (searchForUserInDB.length > 0) {
    //     errors.push({msg: 'This username is already exists'});
    // }
    // Check if inputs got white spaces
    if (hasWhiteSpace(username) || hasWhiteSpace(firstName) || hasWhiteSpace(lastName)) {
        errors.push({msg: 'Please dont use white spaces in inputs'});
    }
    // Check if inputs got numbers
    let hasNumber = /\d/;
    if (hasNumber.test(firstName) || hasNumber.test(lastName)) {
        errors.push({msg: 'Please dont use numbers in name fields'});
    }
    // Check if values too long
    if (username.length > 12 || firstName.length > 12 || lastName.length > 12) {
        errors.push({msg: 'Inputs must be shorter than 12 charters'});
    }
    if (errors.length > 0) {
        res.render('manageUsers', {userList, errors, name: obj.username, admin: obj.isAdmin})
    } else {
        await usersBL.updateUser(req);
        res.redirect('/menu/manage');
    }

});

// Delete User Handler
router.post('/deleteUserForm', async function (req, res, next) {
    let user = await usersBL.deleteUser(req.body.userId);
    let success = []
    success.push({msg: `User ${user} deleted successfully`})
    let obj = utils.getPayloadFromToken(req)
    let userList = await usersBL.getAllUsers();
    let permissions = await moviesBL.permissions(obj.sub);
    res.render('manageUsers', {userList, success, name: obj.username, admin: obj.isAdmin, permissions});
});

function hasWhiteSpace(s) {
    return s.indexOf(' ') >= 0;
}


module.exports = router;