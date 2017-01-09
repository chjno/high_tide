var noble = require('noble');

noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning();
    console.log('scanning...');
  } else {
    noble.stopScanning();
    console.log('bluetooth isn\'t on...');
  }
});

noble.on('discover', function (peripheral) {
  console.log(peripheral);
  console.log('');
  console.log('');
  console.log('');
  var uuid = '9c15ccbcf88546fe970d761a73908b24';
  var mac = 'f4:b8:5e:41:27:5b';
  if (peripheral.id === uuid || peripheral.uuid === uuid || peripheral.address === mac) {
    console.log('found bluno');
    noble.stopScanning();

    peripheral.connect(function (err) {
      console.log('connected to bluno');

      // peripheral.discoverServices(null, function(err, services) {
      peripheral.discoverServices(['dfb0'], function (err, services) {
        console.log('found service: ', services[0].uuid);

        // services[i].discoverCharacteristics(null, function(err, characteristics) {
        services[0].discoverCharacteristics(['dfb1'], function (err, characteristics) {
        // services[0].discoverCharacteristics(['dfb2'], function(err, characteristics) {
          var characteristic = characteristics[0];

          console.log('found characteristic: ', characteristic.uuid);

          characteristic.on('read', function (data, isNotification){
            // data is a buffer
            console.log('on read');
          });

          // characteristic.on('data', function (data, isNotification){
          //   // data == last thing i sent
          //   console.log('hi');
          // });

          characteristic.subscribe(function (err){
            console.log('subscribed');
          });

          characteristic.notify(true, function (error) {
            console.log('notify on');
          });
          



          var stdin = process.openStdin();
          stdin.addListener("data", function (d) {
            toggleGlass(characteristic, d.toString().trim());
          });
        });
      });
    });
  }
});

var toggleGlass = function(characteristic, num){
  const buf1 = new Buffer(num, 'utf-8');
  characteristic.write(buf1, false, function (err, data){
    characteristic.read(function (err, d){
      console.log(d.toString());
    });
  });
};
