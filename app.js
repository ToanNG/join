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

//setup mongoose
app.db = mongoose.connect('mongodb://localhost/join_development');

//config data models
require('./models')(app);

//config passport
require('./passport')(app, passport);

//config all
app.configure(function(){
  //setting
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  //middleware
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({secret: "S3cr3tK3y"}));
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

//config prod
app.configure('production', function(){
  app.enable('view cache');
});

//route requests
require('./routes')(app);

var io = socket.listen(server);
io.sockets.on('connection', function(socket) {
  socket.on('user join', function (user, group) {
    socket.username = user.username;
    console.log(user.username+' has connect to '+group);
    socket.room = group;
    socket.join(group);
    socket.broadcast.to(group).emit('updatechat', user.fullname + ' has connected to this room.');
    console.log(io.roomClients[socket.id]);
  });
  socket.on('update chat', function (data, group) {
    io.sockets.in(group).emit("updatechat", data);
  });
  socket.on('user leave', function (data, group) {
    io.sockets.in(group).emit("updatechat", data);
  });
  socket.on('disconnect', function() {
    socket.broadcast.to(socket.room).emit('updatechat', socket.username + ' has leaved this room.');
    socket.leave(socket.room);
  });
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});