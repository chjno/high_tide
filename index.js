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
 
client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});
 
client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');
  connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
  });
  connection.on('message', function(message) {
      if (message.type === 'utf8') {
          console.log("Received: '" + message.utf8Data + "'");
      }
  });

  var stdin = process.openStdin();
  stdin.addListener("data", function(d) {
    var input = d.toString().trim();
    if (input == '0'){
      connection.sendUTF('0');
    } else if (input == '1'){
      connection.sendUTF('1');
    }
  });
  
  // function sendNumber() {
  //     if (connection.connected) {
  //         var number = Math.round(Math.random() * 0xFFFFFF);
  //         connection.sendUTF(number.toString());
  //         setTimeout(sendNumber, 1000);
  //     }
  // }
  // sendNumber();
});
 
client.connect('ws://172.22.6.89:3002/');
