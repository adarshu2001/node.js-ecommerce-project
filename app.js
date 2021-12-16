var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const { engine : hbs } = require("express-handlebars");
const fileUpload = require('express-fileupload')
var db = require('./config/connection')
// var mdb = require('mdb-ui-kit')
var app = express();
var session = require('express-session')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use("/css",express.static(path.join(__dirname,"node_modules/mdb-ui-kit/css")));
// app.use("/js",express.static(path.join(__dirname,"node_modules/mdb-ui-kit/js")));
app.use(fileUpload())
app.use(session({secret:"#k#e#Y#",cookie:{maxAge:600000}}))

db.connect((err)=>{
  if (err) console.log('Database is not connected'+ err);
  else console.log('Database is connected');
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

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
