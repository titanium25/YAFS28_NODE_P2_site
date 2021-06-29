const mongoose = require('mongoose')

let UsersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    isAdmin: {
        type: Boolean
    },
    isActivated: {
        type: Boolean
    }
}, {collection: 'users'})

module.exports = mongoose.model('User', UsersSchema)