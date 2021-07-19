const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const pathToKey = path.join(__dirname, '..', 'config', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');


/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
function issueJWT(user) {
    const _id = user._id;
    const username = user.username;
    const isAdmin = user.isAdmin;
    const payload = {
        sub: _id,
        username: username,
        isAdmin: isAdmin,
        iat: Date.now()
    }
    return jwt.sign(payload, PRIV_KEY, {algorithm: 'RS256'});
}

/**
 * @param {*} s - String object. Function will check the string for white spaces and return boolean
 */
function hasWhiteSpace(s) {
    return s.indexOf(' ') >= 0;
}

/**
 * @param {*} req - Take request param and return decoded JWT payload
 */
function getPayloadFromToken(req) {
    const token = req.cookies.jwt;
    const decodedToken = jwt.decode(token, {
        complete: true
    });

    return decodedToken.payload;
}

function makeId() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


module.exports.issueJWT = issueJWT;
module.exports.hasWhiteSpace = hasWhiteSpace;
module.exports.getPayloadFromToken = getPayloadFromToken;
module.exports.makeId = makeId;

