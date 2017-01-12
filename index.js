var toggle = {
  name: 'toggle',
  alive: false,
  sock: {},
  server: '10.0.0.2',
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
  server: '10.0.0.3',
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
  server: '10.0.0.4',
  port: 3003,
  url: function(){
    var link = 'ws://' + this.server + ':' + this.port + '/';
    return link;
  }
};

// var mcus = [toggle, outlet, light];
var mcus = [toggle, light];
// var mcus = [toggle];

var ping = require('ping');
var express = require('express');
var app = express();
var server = app.listen(3000, listen);
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
var osc = require('node-osc');
var oscClient = new osc.Client('127.0.0.1', 3334);
var oscServer = new osc.Server(3333, '127.0.0.1');

function listen(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

client.on('connect', function(socket) {
  // console.log('WebSocket Client Connected');
  connectIndex++;
  if (connectIndex < mcus.length){
    connectMCU(mcus[connectIndex]);
  }

  socket.on('message', function(message) {
    // console.log(message.utf8Data);

    if (parseInt(message.utf8Data, 10) >= 0){
      switch (socket.remoteAddress){
        case toggle.server:
          console.log('toggle ' + message.utf8Data);
          if (light.sock.connected){
            if (message.utf8Data == '0'){
              light.sock.sendUTF('0');
            } else if (message.utf8Data == '1'){
              light.sock.sendUTF('1');
            }
          } else {
            console.log('light not connected');
            // try connecting to light?
          }
          console.log();
          break;
        case outlet.server:
          console.log('outlet ' + message.utf8Data);
          if (message.utf8Data == '0'){
            oscClient.send('/outlet', 1);
          } else {
            oscClient.send('/outlet', 2);
          }
          break;
      }
      
    } else {
      for (var i = 0; i < mcus.length; i++){
        if (message.utf8Data == mcus[i].name){
          mcus[i].sock = socket;
          console.log(mcus[i].name + ' connected');
          break;
        }
      } 
    }
  });

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

// for testing light
var stdin = process.openStdin();
stdin.addListener("data", function(d) {
  if (light.sock.connected){
    var input = d.toString().trim();
    if (input == '0'){
      light.sock.sendUTF('0');
    } else if (input == '1'){
      light.sock.sendUTF('1');
    }
  }
});



function connectMCU(obj){

  function sockMCU(){
    console.log('connecting to ' + obj.name + '...');
    client.connect(obj.url());
  }

  function p(){
    if (obj.alive){
      clearInterval(interval);
      obj.timeout = setTimeout(sockMCU, 2000);
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

var connectIndex = 0;
connectMCU(mcus[connectIndex]);

oscServer.on('noise', function(msg, rinfo){
  console.log(msg);

  if (msg == 1){
    // if outlet plugged
      // light off
    // else if outlet unplugged
      // light on
  } else {
    // if outlet plugged
      // light on
    // else if outlet unplugged
      // light off
  }
});
