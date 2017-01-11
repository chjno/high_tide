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

app.get('/on', function (req, res) {
  console.log('switch on');
});

app.get('/off', function (req, res) {
  console.log('switch off');
});

// var stdin = process.openStdin();
// stdin.addListener("data", function(d) {
//   var input = d.toString().trim();
//   if (input == '0'){
//     request('http://172.22.6.89/off', function (error, response, body) {
//       if (!error && response.statusCode == 200) {
//         console.log(body);
//       }
//     });
//   } else if (input == '1'){
//     request('http://172.22.6.89/on', function (error, response, body) {
//       if (!error && response.statusCode == 200) {
//         console.log(body);
//       }
//     });
//   }
// });

var io = require('socket.io')(server);

io.on('connection', function(socket){

  io.to(socket.id).emit('news', socket.id);
  console.log('connected ' + socket.id);
  console.log();

  socket.on('message', function (msg){
    console.log(msg);
  });

  socket.on('42', function (msg){
    console.log(msg);
  });

  socket.on('2', function (msg){
    console.log('2');
  });

  socket.on('5', function (msg){
    console.log('5');
  });

  socket.on('disconnect', function(){

    console.log('disconnected: ' + socket.id);
  });
});

server.listen(port, function() {
  console.log('Express server running on *:' + port);
});
