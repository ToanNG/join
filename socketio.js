exports = module.exports = function(socket, server) {
  var io = socket.listen(server);
  io.sockets.on('connection', function(socket) {
    socket.on('user join', function (user, group) {
      socket.username = user.username;
      socket.room = group;
      socket.join(group);
      socket.broadcast.to(group).emit('update chat', user.fullname + ' has connected to this room.', group);
      // console.log(io.roomClients[socket.id]);
    });
    socket.on('update chat', function (data, group) {
      io.sockets.in(group).emit("update chat", data, group, socket.username);
    });
    socket.on('user leave', function (data, group) {
      io.sockets.in(group).emit("updatechat", data);
    });
    socket.on('disconnect', function() {
      socket.broadcast.to(socket.room).emit('update chat', socket.username + ' has leaved this room.');
      socket.leave(socket.room);
    });
  });
};