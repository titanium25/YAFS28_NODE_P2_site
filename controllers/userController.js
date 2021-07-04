var express = require('express');
var router = express.Router();

const usersBL = require('../models/usersBL')

// Users Console
router.get('/', async function (req, res, next) {
    let userList = await usersBL.getAllUsers();
    res.render('manageUsers', {userList});
});

// Add User
router.get('/addUser',function(req, res, next) {
    res.render('addUser');
});

// Add User Handler
router.post('/addUserForm',async function(req, res, next) {
    let status = await usersBL.addUser(req);
    req.flash('success_msg', status);
    res.redirect('/menu/manage');
});

// Edit User Handler
router.post('/editUserForm',async function(req, res, next) {
    let status = await usersBL.updateUser(req);
    req.flash('success_msg', status);
    res.redirect('/menu/manage');
});

// Delete User Handler
router.post('/deleteUserForm',async function(req, res, next) {
    let status = await usersBL.deleteUser(req.body.userId);
    req.flash('success_msg', status);
    res.redirect('/menu/manage');
});


module.exports = router;