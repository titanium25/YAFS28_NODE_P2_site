const mongoose = require('mongoose');

let UsersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isActivated: {
        type: Boolean,
        default: false
    }
}, {collection: 'users'})


module.exports = mongoose.model('User', UsersSchema)