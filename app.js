var express = require('express');
var http = require('http');

var app = express();
app.set('port',3000);

http.createServer(app).listen(app.get('port'),function(){
  console.log('Express server listening on port 3000');
});

// Middleware
app.use(function(req,res, next){
  if (req.url == '/'){
    res.end("Hello");
  }else{
    next();
  }
});

app.use(function(req,res, next){
  if (req.url == '/forbidden'){
    next(new Error("wops, denied"));
  }else{
    next();
  }
});

app.use(function(req,res, next){
  if (req.url == '/test'){
    res.end("Test");
  }else{
    next();
  }
});

app.use(function(req,res){
  res.send(404, "Page Not Found Sorry");
});

app.use(function(err, req, res, next){
  // NODE_ENV = 'production'
  if (app.get('env') == 'development'){
    var errorHandler = express.errorHandler();
    errorHandler(err,req,res,next);
  }else{
    res.send(500);
  }
});

//var path = require('path');
//var favicon = require('static-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');
//
//var routes = require('./routes');
//var users = require('./routes/user');
//
//var app = express();
//
//// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
//
//app.use(favicon());
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
//app.use(app.router);
//
//app.get('/', routes.index);
//app.get('/users', users.list);
//
///// catch 404 and forwarding to error handler
//app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});
//
///// error handlers
//
//// development error handler
//// will print stacktrace
//if (app.get('env') === 'development') {
//    app.use(function(err, req, res, next) {
//        res.render('error', {
//            message: err.message,
//            error: err
//        });
//    });
//}
//
//// production error handler
//// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//    res.render('error', {
//        message: err.message,
//        error: {}
//    });
//});
//
//
//module.exports = app;
