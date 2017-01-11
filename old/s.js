var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = 3000;
var io = require('socket.io')(server);
var request = require('request');

function listen(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

var io = require('socket.io')(server);

io.on('connection', function (socket){

  console.log('connected ' + socket.id);

  socket.on('disconnect', function(){
    console.log('disconnected: ' + socket.id);
  });
});

server.listen(port, function() {
  console.log('Express server running on *:' + port);
});
