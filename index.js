var toggle = {
  name: 'toggle',
  alive: false,
  sock: {},
  server: '172.22.6.89',
  port: 3001,
  url: function(){
    var link = 'ws://' + this.server + ':' + this.port + '/';
    return link;
  }
};

var outlet = {
  name: 'outlet',
  alive: false,
  sock: {},
  server: '172.22.6.89',
  port: 3002,
  url: function(){
    var link = 'ws://' + this.server + ':' + this.port + '/';
    return link;
  }
};

var light = {
  name: 'light',
  alive: false,
  sock: {},
  server: '172.22.6.89',
  port: 3003,
  url: function(){
    var link = 'ws://' + this.server + ':' + this.port + '/';
    return link;
  }
};

var mcus = [toggle, outlet, light];

var ping = require('ping');
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

client.on('connect', function(socket) {
  console.log('WebSocket Client Connected');

  socket.on('message', function(message) {

    switch (socket){
      case toggle.sock:
        console.log('toggle ' + message.utf8Data);
        if (message.utf8Data == '0'){
          light.sock.sendUTF('0');
        } else if (message.utf8Data == '1'){
          light.sock.sendUTF('1');
        }
        break;
      case outlet.sock:
        
        break;
    }

    if (socket == toggle.sock){
    } else {
      for (var i = 0; i < mcus.length; i++){
        if (message.utf8Data == mcus[i].name){
          mcus[i].sock = socket;
          break;
        }
      }
    }
  });

  // for testing light
  if (light.sock.connected){
    var stdin = process.openStdin();
    stdin.addListener("data", function(d) {
      var input = d.toString().trim();
      if (input == '0'){
        light.sock.sendUTF('0');
      } else if (input == '1'){
        light.sock.sendUTF('1');
      }
    });
  }

  socket.on('error', function(error) {
    console.log("Connection Error: " + error.toString());
    // reset mcu settings and try to reconnect?
  });

  socket.on('close', function() {
    console.log('Connection Closed');
    // reset mcu settings and try to reconnect  
  });
});

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

function connectMCU(obj){

  function sockMCU(){
    console.log(obj.url());
    client.connect(obj.url());
  }

  function p(){
    if (obj.alive){
      clearInterval(interval);
      setTimeout(sockMCU, 2000);
    } else {
      ping.sys.probe(obj.server, function(isAlive){
        if (isAlive){
          console.log(obj.server + ' is alive');
          obj.alive = true;
        } else {
          console.log(obj.server + ' is not responding');
        }
      });
    }
  }

  var interval = setInterval(p, 1500);
}

connectMCU(toggle);
