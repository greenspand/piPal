//HUe Variables
var lights = require('./philipsHue');
var utils = require('./util/utils');
var state = lights.getLightState();


//Async await functions
var async = require('asyncawait/async');
var await = require('asyncawait/await');
//Serial Port Variables
var SerialPort = require('serialport');
var serialPort = new SerialPort('/dev/ttyAMA0', {
  baudrate: 9600,
  autoOpen: false
});
serialPort.open(function(error) {
  if (error) {
    console.log('failed to open: ' + error);
  } else {
    console.log('open');
    serialPort.on('data', function(data) {
      var date = new Date();
      var hour = date.getHours();
      var min = date.getMinutes();
      var msg = '' + data;
      var fullMsg = msg.split(':');
      var place = fullMsg[0];
      if (utils.checkIfDefined(place)) {
        switch (place) {
          case 'cor':
            var lightsState = fullMsg[1];
            if (hour > utils.lightsOnHour(date)) {
              if (utils.checkIfDefined(lightsState)) {
                Rx.Observable.of(lightState).subscribe(function(x) {
                  if (x === 'on' && state.off()) {
                    lights.startStopLights(1, 3, state.on());
                  } else if (x === 'off' && state.on()) {
                    lights.startStopLights(1, 3, state.off());
                  }
                  console.log('Cor lights: ' + lux);
                });
              }
            } else {
              if (state.on()) {
                lights.startStopLights(1, 3, state.off());
              }
            }
            break;

          case 'liv':
            var lightsState = fullMsg[1];
            Rx.Observable.of(lightState).filter(function(x) {
              return utils.checkIfDefined(x);
            }).subscribe(function(x) {
              if (x === 'on' && state.off()) {
                lights.startStopLights(5, 6, state.on());
              } else if (x === 'off' && state.on()) {
                lights.startStopLights(5, 6, state.off());
              }
            });

            break;

          case 'lab':
            var x = fullMsg[1];
            if (utils.checkIfDefined(x)) {
              var lux = parseInt(x);
              console.log('Lab light: ' + lux);
            }
            break;
        }
      }
    });
    serialPort.write('ls\n', function(err, results) {
      console.log('Error: ' + err);
      console.log('Results: ' + results);
    });
  }
});
