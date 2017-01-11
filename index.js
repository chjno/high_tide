var lswitch = {};
var outlet = {};
var light = {};
var mcus = [lswitch, outlet, light];
var switchServer = 'ws://172.22.6.89:3001/';
var outletServer = 'ws://172.22.6.89:3002/';
var lightServer = 'ws://172.22.6.89:3003/';
var servers = [switchServer, outletServer, lightServer];

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

client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');

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


        // DELETE ME
        if (lswitch.connected){
          console.log('lswitch.connected == true');
        } else {
          console.log('lswitch.connected == false');
        }

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

  connection.on('error', function(error) {
    console.log("Connection Error: " + error.toString());
    // reset mcu settings and try to reconnect?
  });

  connection.on('close', function() {
    console.log('Connection Closed');
    // reset mcu settings and try to reconnect  
  });
});

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

function trySocketing(server, delay){
  function conn(){
    client.connect(server);
  }

  setTimeout(conn, delay);
}

function connectMCUs(){
  for (var i = 0; i < mcus.length; i++){
    if (!mcus[i].connected){
      trySocketing(servers[i], 1000);
    }
  }
}

// DELETE ME
if (lswitch.connected){
  console.log('lswitch.connected == true');
} else {
  console.log('lswitch.connected == false');
}

// connectMCUs();
// client.connect(lightServer);
client.connect(switchServer);

// DELETE ME
// if (!lswitch.connected){
//   trySocketing(lightServer, 1000);
// }
