var hue = require('node-hue-api'),
  HueApi = hue.HueApi,
  lightState = hue.lightState;

var ip = require("ip");

var displayResult = function(result) {
  console.log(result);
};

var displayError = function(err) {
  console.error(err);
};

var host = '192.168.178.91',
  username = 'IiUTGOISIqQRetaXh2Bsl9BNSqEd90c75wZ8V47Y',
  api = new HueApi(host, username),
  state = lightState.create();

module.exports = {
  startStopLights: function(startBulb, endBulb, lightState) {
    for (var t = startBulb; t < endBulb; t++) {
      api.setLightState(t, lightState)
        .then(displayResult)
        .done();
    }
  },
  getLightState: function() {
    return state;
  },
  createLightStateOn: function() {
    var stateOn = lightState.create().on().white(500, 100);
    return stateOn;
  },
  createLightStateOff: function() {
    var stateOff = lightState.create().off().white(500, 0);
    return stateOff;
  }

};
