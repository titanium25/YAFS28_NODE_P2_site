var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var expressLayouts = require('express-ejs-layouts');
var passport = require('passport');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('connect-flash');


var loginController = require('./controllers/loginController');
var movieController = require('./controllers/movieController');
var userController = require('./controllers/userController');

var app = express();

// Passport config
require('./config/passport')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//DB config
const dbString = require('./config/keys').MongoURI;
const dbOptions = {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false};

//Connect to Mongo
mongoose.connect(dbString, dbOptions)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Bodyparser
app.use(express.urlencoded({extended : false}))

// Express Sessions
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
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

app.use('/', loginController);
app.use('/menu', movieController);
app.use('/menu/manage', userController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
