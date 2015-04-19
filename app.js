var express = require('express');
var http = require('http');
var path = require('path');
var config = require('config');
var log = require('libs/log')(module);
var favicon = require('serve-favicon');
var logger = require('morgan');

var app = express();
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
if(app.get('env') == 'development'){
  app.use(express.logger('dev'));
} else {
  app.use(express.logger('default'));
}

app.use(express.bodyParser()); // req.body
app.use(express.cookieParser()); // req.cookies

app.use(app.router);

app.get('/',function(req, res, end){
  res.render("index");
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next){
  // NODE_ENV = 'production'
  if (app.get('env') == 'development'){
    var errorHandler = express.errorHandler();
    errorHandler(err,req,res,next);
  }else{
    res.send(500);
  }
});

http.createServer(app).listen(config.get('port'),function(){
  log.info('Express server listening on port ' + config.get('port'));
});