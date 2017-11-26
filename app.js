var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var session = require('express-session');
var passport = require('passport');
var passportConfig = require('./config/passport')(passport);
var flash = require('express-flash');
var mongoose = require('mongoose');
var MongoDBStore = require('connect-mongodb-session')(session);


var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var mongo_url = process.env.MONGO_URL;
mongo_url = mongo_url.replace('{user}', process.env.MONGO_COLOR_USER);
mongo_url = mongo_url.replace('{pword}', process.env.MONGO_COLOR_PASSWORD);
mongo_url = mongo_url.replace('{db}', process.env.MONGO_COLOR_DB_NAME);

console.log(mongo_url);

var local = process.env.LOCAL;

mongoose.Promise = global.Promise;
mongoose.connect(mongo_url, { useMongoCLient: true })
    .then( () => { console.log('Connected to MongoDB'); })
    .catch( (err) => { console.log('Error connecting'), err });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (local) {
    var store = new MongoDBStore({uri: mongo_url, collection: 'sessions'}, function (err) {
        if (err) {
            console.log('Error, can\'t connect to store session')
        }
    });
} else {
    var store = new MongoDBStore({uri: mongo_url, collection: 'sessions-color'}, function (err) {
        if (err) {
            console.log('Error, can\'t connect to store session')
        }
    });
}

app.use(session({
    secret: 'need better',
    resave: true,
    saveUninitialized: true,
    store: store
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
