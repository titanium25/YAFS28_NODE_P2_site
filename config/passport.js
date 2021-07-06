const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const keys = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

// Load User Model
const User = require('../models/userModel');

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, password, done) => {
            // Match User
            User.findById(jwt_payload._id)
                .then(user => {
                    if(!user){
                        return done(null, false, {message: 'That username is not registered'});
                    }

                    // Match the Password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if(err) throw  err;

                        if(isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, {message: 'Password incorrect'})
                        }
                    })
                })
                .catch(err => console.log(err))
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}

