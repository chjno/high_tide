var express = require('express');
var app = express();
var server = app.listen(3000, listen);
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

var stdin = process.openStdin();
stdin.addListener("data", function(d) {
  var input = d.toString().trim();
  if (input == '0'){
    request('http://172.22.6.89/off', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
    });
  } else if (input == '1'){
    request('http://172.22.6.89/on', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
    });
  }
});
