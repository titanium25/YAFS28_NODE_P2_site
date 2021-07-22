const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let tokenSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
}, {collection: 'tokens'})


module.exports = mongoose.model('Token', tokenSchema)