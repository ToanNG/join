exports = module.exports = function(socket, server) {
  var io = socket.listen(server);

  io.sockets.on('connection', function(socket) {
    socket.on('user join', function (user) {
      socket.user = user;
      socket.rooms = user.groups;

      socket.rooms.forEach(function(room) {
        socket.join(room);
        socket.broadcast.to(room).emit('update chat', socket.user.fullname + ' has joined to this room.', room);
      });
      // console.log(io.roomClients[socket.id]);
    });

    socket.on('update chat', function (message, room) {
      io.sockets.in(room).emit("update chat", message, room, socket.user);
    });

    socket.on('update share', function (image, room) {
      socket.broadcast.to(room).emit("update share", image, room, socket.user);
    });

    socket.on('disconnect', function() {
      socket.rooms.forEach(function(room) {
        socket.broadcast.to(room).emit('update chat', socket.user.fullname + ' has leaved this room.', room);
        socket.leave(room);
      });
    });
  });
};