var express = require('express');
var router = express.Router();

const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Token = require('../models/tokenModel');

const utils = require('../lib/utils');
const jsonDAL = require('../DAL/jsonDAL');

// Login page
router.get('/', function (req, res, next) {
    res.render('login');
});

// Activation page
router.get('/register', function (req, res, next) {
    res.render('register');
});

// Verify page
router.get('/user/verify/:id/:token', async function (req, res, next) {
    const user = await User.findOne({_id: req.params.id});
    const token = await Token.findOne(({userId: user._id, token: req.params.token}));
    if(!user || !token) {
        req.flash('error_msg', 'Invalid link')
        res.redirect('/');
    } else {
        let errors = [];
        errors.push({msg: 'Email verified successfully, please fill the form to activate the account'});
        res.render('register', {errors, username: user.username});
    }
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
            .then(async user => {
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
                    user.isActivated = true;
                    // Delete token after activation
                    await Token.deleteOne({userId: user._id})

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
router.post('/signIn', function (req, res, next) {
    const {username, password, password2} = req.body
    let errors = [];
    User.findOne({username: req.body.username})
        .then((user) => {
            if (!user) {
                errors.push({msg: 'That username is not registered'})
                res.render('login', {errors})
            }

            if (!user.isActivated) {
                errors.push({msg: 'That username is not activated'})
                res.render('login', {errors})
            }

            // Match the Password
            bcrypt.compare(password, user.password, async (err, isMatch) => {
                if (err) throw  err;

                if (isMatch) {
                    let usersJSON = await jsonDAL.getUsers();
                    let usersDataArr = usersJSON.usersData;

                    let findUser = usersDataArr.find(u => u.id === user.id)
                    // const expirationSeconds = 60 * 60 * 24 * 7; // one week
                    const cookieExpiration = Date.now() + findUser.timeOut * 1000;
                    let token = utils.issueJWT(user)
                    // Send Set-Cookie header
                    res.cookie('jwt', token, {expires: new Date(cookieExpiration), httpOnly: true});
                    res.redirect('/menu');
                } else {
                    errors.push({msg: 'Password incorrect'})
                    res.render('login', {errors})
                }
            })

        });

});



module.exports = router;