const JwtStrategy = require('passport-jwt').Strategy
const fs = require('fs');
const path = require('path');
const User = require('mongoose').model('User');

const pathToKey = path.join(__dirname, 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options = {
    jwtFromRequest: req => {
        let token = null;
        if (req && req.cookies) token = req.cookies['jwt'];
        return token;
    },
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
};

const strategy = new JwtStrategy(options, (jwt_payload, done) => {
    // We will assign the `sub` property on the JWT to the database ID of user
    User.findOne({_id: jwt_payload.sub})
        .then((user) => {
            if(user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => done(err, null));
});

// app.js will pass the global passport object here, and this function will configure it
module.exports = (passport) => {
    // The JWT payload is passed into the verify callback
    passport.use(strategy);
}