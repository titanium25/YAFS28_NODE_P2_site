var express = require('express');
var router = express.Router();

const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

// Login page
router.get('/', function (req, res, next) {
    res.render('login');
});

// Register page
router.get('/register', function (req, res, next) {
    res.render('register');
});

// Register Handler
router.post('/registerForm', async function (req, res, next) {
    const {username, password, password2} = req.body
    let errors = [];

    // Check required fields
    if (!username || !password || !password2) {
        errors.push({msg: 'Please fill in all fields'});
    }

    // Check password match
    if (password !== password2) {
        errors.push({msg: 'Password do not match'})
    }

    // Check pass length
    if (password.length < 6) {
        errors.push({msg: 'Password should be at least 6 characters'})
    }

    // Check if username is unique
    let searchForUser = await User.find({username})
    if (searchForUser.length > 0) {
        errors.push({msg: 'This username is already exists'});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            username,
            password,
            password2
        })
    } else {
        // Validation passed
        User.findOne({username: username})
            .then(user => {
                // Check if Username is EXISTS
                if (!user) {
                    // Error - Username NOT Exists
                    errors.push({msg: 'This username NOT exists, please contact the administrator'})
                    res.render('register', {
                        errors,
                        username,
                        password,
                        password2
                    })
                    // Pass - Username Exists
                } else {
                    // Check if password for this user already SET. If User is activated or not
                    if (user.isActivated) {
                        // Error - User exists AND activated
                        errors.push({msg: 'This user is already activated'})
                        res.render('register', {
                            errors,
                            username,
                            password,
                            password2
                        })
                    }
                    // Mongoose UPDATE existing document
                    user.password = password;
                    user.isAdmin = false;
                    user.isActivated = true;

                    const payload = {id: user._id}

                    jwt.sign(
                        payload,
                        keys.secretOrKey,
                        {expiresIn: 3600}
                    )

                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(user.password, salt, (err, hash) => {
                                if (err) throw err;
                                // Set Password to Hashed
                                user.password = hash;
                                // Save User
                                user.save()
                                    .then(user => {
                                        req.flash('success_msg', 'You are now registered and can log in')
                                        res.redirect('/');
                                    })
                                    .catch(err => console.log(err))
                            }
                        ))
                }
            })
    }
});

// Login handler
router.post('/signIn', async function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/menu',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next)
});

module.exports = router;