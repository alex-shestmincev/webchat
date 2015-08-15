var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var log = require('./lib/log')(module);
var favicon = require('serve-favicon');
var logger = require('morgan');
var HttpError = require('./error').HttpError;
var mongoose = require('./lib/mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = express();
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));

if(app.get('env') == 'development'){
  app.use(logger('dev'));
} else {
  app.use(logger('default'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // req.cookies

var sessionStore = require('./lib/sessionStore');

app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: sessionStore,
  resave: true,
  saveUninitialized: true
}));

app.use(require('./middleware/sendHttpError'));
app.use(require('./middleware/loadUser'));

//app.use(app.router);

require('./routes')(app);

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next){
  if (typeof err == 'number'){
    err = new Http/Error(err);
  }

  if (err instanceof HttpError){
    res.sendHttpError(err);
  } else {
    if (app.get('env') == 'development'){
      var errorHandler = express.errorHandler()(err,req,res,next);
    }else{
      log.error(err);
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});

var server = http.createServer(app);
var port = Number(process.env.PORT || config.get('port'));
server.listen(port,function(){
  log.info('Express server listening on port ' + port);
});

var io = require('./socket')(server);
app.set('io', io);
log.debug('io - ' + app.get('io'));

