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

var mcus = [toggle, outlet, light];
var toConnect = [toggle, outlet, light];
var allHere = false;

var ping = require('ping');
var express = require('express');
var app = express();
var server = app.listen(3000, listen);
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
var osc = require('node-osc');
var oscClient = new osc.Client('127.0.0.1', 3334);
var oscServer = new osc.Server(3333, '127.0.0.1');
var serialport = require("serialport");
var serial = serial = new serialport("/dev/tty.usbmodem1421", {
  baudRate: 9600,
  autoOpen: false
});

function listen(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

client.on('connect', function (socket) {
  var mcuIndex;
  for (var j = 0; j < mcus.length; j++){
    if (socket.remoteAddress == mcus[j].server){
      mcuIndex = j;
    }
  }

  function resetConnection(){
    // thisMCU = mcus[mcuIndex];
    mcus[mcuIndex].sock = {};
    socket.close();
    toConnect.push(mcus[mcuIndex]);
    if (allHere){
      allHere = false;
      connectMCU();
    }
    console.log('lost connection to ' + mcus[mcuIndex].name);
  }
  
  var resetTimeout;
  function checkPulse(){
    // console.log('checking pulse ' + mcus[mcuIndex].name);
    socket.sendUTF('.');
    resetTimeout = setTimeout(resetConnection, 1000);
  }

  setTimeout(checkPulse, 5000);

  toConnect.splice(0, 1);
  if (toConnect.length > 0){
    connectMCU();
  } else {
    allHere = true;
  }

  socket.on('message', function (message) {
    // if (message.utf8Data != '.'){
    //   console.log(message.utf8Data);
    // }

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

          if (serial.isOpen()){
            if (message.utf8Data == '0'){
              serial.write('0');
            } else if (message.utf8Data == '1'){
              serial.write('1');
            }
          }

          console.log();
          break;
        case outlet.server:

          // send to light
          console.log('outlet ' + message.utf8Data);
          if (message.utf8Data == '0'){
            oscClient.send('/outlet', 1);
          } else {
            oscClient.send('/outlet', 2);
          }
          break;
      }
      
    } else if (message.utf8Data == '.'){
      clearTimeout(resetTimeout);
      setTimeout(checkPulse, 5000);
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

  socket.on('error', function (error) {
    console.log("Connection Error: " + error.toString());
    // reset mcu settings and try to reconnect?
  });

  socket.on('close', function () {
    console.log('Connection Closed');
    // reset mcu settings and try to reconnect  
  });
});

client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
    // console.log(error);
    // var url = 'ws://' + error.address + ':' + error.port + '/';
    for (var i = 0; i < mcus.length; i++){
      if (error.address == mcus[i].server){
        connectMCU(mcus[i]);
        break;
      }
    }
});

function openSerial(){
  try {
    serial.open(function (err){
      if (err){
        setTimeout(openSerial, 5000);
        return console.log('serial - phone error');
      }
      console.log('serial - phone connected');
    });
  } catch (e){
    console.log(e);
  }
}

openSerial();
// serial.on('data', sendSerialData);
serial.on('close', showPortClose);
serial.on('error', serialError);

function showPortClose(){
  console.log('serial - phone disconnected');
  setTimeout(openSerial, 5000);
}

function serialError(){
  console.log('serial error');
}

// for testing light
// var stdin = process.openStdin();
// stdin.addListener("data", function (d) {
//   if (light.sock.connected){
//     var input = d.toString().trim();
//     if (input == '0'){
//       light.sock.sendUTF('0');
//     } else if (input == '1'){
//       light.sock.sendUTF('1');
//     }
//   }
// });

function connectMCU(){
  var obj = toConnect[0];

  // function sockMCU(){
  //   console.log('connecting to ' + obj.name + '...');
  //   client.connect(obj.url());
  // }

  function p(){
    if (obj.alive){
      clearInterval(interval);
      // obj.timeout = setTimeout(sockMCU, 2000);
      console.log('connecting to ' + obj.name + '...');
      try{
        client.connect(obj.url());
      } catch (e){
        console.log(e);
        client.connect(obj.url());
      }
    } else {
      ping.sys.probe(obj.server, function (isAlive){
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

connectMCU();


oscServer.on('noise', function (msg, rinfo){
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
