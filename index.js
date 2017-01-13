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
var serial = new serialport("/dev/tty.usbmodem1421", {
  baudRate: 9600,
  autoOpen: false
});

function listen(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

///////////////////////////////////////////////////////////////////////////////
// global variables
///////////////////////////////////////////////////////////////////////////////

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
// var toConnect = [toggle, outlet, light];
var toConnect = [toggle];
var allHere = false;


function tellLight(device, state){
  if (light.sock.connected){
    light.sock.sendUTF(device + state);
  }
}

function tellPhone(state){
  if (serial.isOpen()){
    serial.write(state);
  }
}

function tellMax(device, state){
  oscClient.send('/' + device, parseInt(state, 10));
}

///////////////////////////////////////////////////////////////////////////////
// websockets
///////////////////////////////////////////////////////////////////////////////

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

  socket.on('message', function (message) {
    // testing
    // if (message.utf8Data != '.'){
    //   console.log(message.utf8Data);
    // }

    // if message is an int
    if (parseInt(message.utf8Data, 10) >= 0){

      switch (socket.remoteAddress){

        case toggle.server:
          console.log('toggle ' + message.utf8Data);

          tellLight('t', message.utf8Data); 
          tellPhone(message.utf8Data);
          tellMax('t', message.utf8Data);
          break;

        case outlet.server:
          console.log('outlet ' + message.utf8Data);

          tellLight('o', message.utf8Data);
          tellMax('o', message.utf8Data);
          break;


        case light.server:
          console.log('light plugged ' + message.utf8Data);

          tellMax('l', message.utf8Data);
          break;
      }
      
    // pulse received
    } else if (message.utf8Data == '.'){
      clearTimeout(resetTimeout);
      setTimeout(checkPulse, 5000);

    // device connected
    } else {
      for (var i = 0; i < mcus.length; i++){
        if (message.utf8Data == mcus[i].name){
          mcus[i].sock = socket;
          console.log(mcus[i].name + ' connected');
          break;
        }
      }

      // remove device from list of devices to connect
      toConnect.splice(0, 1);
      if (toConnect.length > 0){
        connectMCU();
      } else {
        allHere = true;
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
    connectMCU();
    // for (var i = 0; i < mcus.length; i++){
    //   if (error.address == mcus[i].server){
    //     break;
    //   }
    // }
});

///////////////////////////////////////////////////////////////////////////////
// serial (phone)
///////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////
// osc (max)
///////////////////////////////////////////////////////////////////////////////

oscServer.on('gain', function (state, rinfo){
  console.log(state);

  tellLight('m' + state.toString());
});

///////////////////////////////////////////////////////////////////////////////
// testing from node console
///////////////////////////////////////////////////////////////////////////////

var stdin = process.openStdin();
stdin.addListener("data", function (input) {
  switch (input[0]){
    case p:
      tellPhone(input[1]);
      break;
    case m:
      tellMax(input[1], input[2]);
      break;
    case l:
      tellLight(input[1], input[2]);
      break;
  }
});

///////////////////////////////////////////////////////////////////////////////
// connecting to devices
///////////////////////////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////////////////////////

connectMCU();
