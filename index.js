var express = require('express');
var app = express();
var server = app.listen(3000, listen);
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

function listen(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

var lswitch = {};
var light = {};
client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');

  connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
  });
  connection.on('message', function(message) {

    if (connection == lswitch){
      console.log(message.utf8Data);
      if (light.connected){
        if (message.utf8Data == '0'){
          light.sendUTF('0');
        } else if (message.utf8Data == '1'){
          light.sendUTF('1');
        }
      }
    } else {
      if (message.utf8Data == 'switch'){
        console.log('switch connected');
        lswitch = connection;
      } else if (message.utf8Data == 'light'){
        console.log('light connected');
        light = connection;
      }
    }
  });

  if (light.connected){
    var stdin = process.openStdin();
    stdin.addListener("data", function(d) {
      var input = d.toString().trim();
      if (input == '0'){
        light.sendUTF('0');
      } else if (input == '1'){
        light.sendUTF('1');
      }
    });
  }
});

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});
 
// client.connect('ws://172.22.6.89:3002/');
client.connect('ws://172.22.6.89:3001/');
