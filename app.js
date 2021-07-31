const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');


const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');

const loginController = require('./controllers/loginController');
const movieController = require('./controllers/movieController');
const userController = require('./controllers/userController');
const memberController = require('./controllers/memberController');




/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the ..env file via `process..env.VARIABLE_NAME` syntax
require('dotenv').config();

// Create the Express application
const app = express();


// Configures the database and opens a global connection that can be used in any module with `mongoose.connection`
require('./config/database');

// Must first load the models
require('./models/dbModels/userModel');

// Pass the global passport object into the configuration function
require('./config/passport')(passport);

// This will initialize the passport object on every request
app.use(passport.initialize());
app.use(passport.session());

// Instead of using body-parser middleware, use the new Express implementation of the same thing
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Express Sessions
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// EJS view engine setup
app.use(expressLayouts)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set("layout extractScripts", true);



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * -------------- ROUTES ----------------
 */
app.use('/', loginController);
app.use('/menu', movieController);
app.use('/menu/manage', userController);
app.use('/menu/subs', memberController);


/**
 * -------------- SERVER ----------------
 */



const server = app.listen(8080, function() {
  console.log('Ready on port %d', server.address().port);
});



module.exports = app;
