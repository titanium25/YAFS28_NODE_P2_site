const mongoose = require('mongoose');

require('dotenv').config();

// fixes for the deprecation warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

/**
 * -------------- DATABASE ----------------
 */

//DB config
const dbString = process.env.DB_STRING;
const dbOptions = {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false};

//Connect to Mongo
mongoose.connect(dbString, dbOptions)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));