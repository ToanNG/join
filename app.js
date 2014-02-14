//module dependencies.
var express = require('express')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , socket = require('socket.io')
  , flash = require('connect-flash')
;

//create express app
var app = express(),
  server = http.createServer(app);

//set environment variables
app.config = require('./app/config');

//setup mongoose
app.db = mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/join_development');

//config data models
require('./app/models')(app);

//config passport
require('./app/passport')(app, passport);

//config all
app.configure(function(){
  //setting
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'app/views'));
  app.set('view engine', 'jade');

  //middleware
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({secret: "5up3rS3cr3tK3y"}));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('stylus').middleware(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res){
    res.status(400);
    res.render('404.jade');
  });
});

//config dev
app.configure('development', function(){
  app.use(express.errorHandler());
});

//config stage
app.configure('staging', function(){
});

//config prod
app.configure('production', function(){
  app.enable('view cache');
});
//$ NODE_ENV=production node app.js
//or you can export them into your shell environment:
//$ export NODE_ENV=production
//$ node app.js

//route requests
require('./app/routes')(app);

require('./app/socketio')(socket, server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});