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
router.post('/addUserForm', async function(req, res, next) {
    await usersBL.addUser(req);
    req.flash('success_msg', `User ${req.body.firstName} ${req.body.lastName} Added Successfully`);
    res.redirect('/menu/manage');
});
module.exports = router;