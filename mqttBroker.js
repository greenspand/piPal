// Lets require/import the HTTP module
var mosca = require('mosca');
var lights = require('./philipsHue');
var state = lights.getLightState();
var utils = require('.util//utils');
var ip = require("ip");
//Lets define a port we want to listen to
const HOST = ip.address();
const PORT = 8080;

/*possible topics the broker receives messages from*/

//MQTT SETUP
var device = {
  espruino: 'espruino',
  duo: 'duo'
};

var area = {
  house: 'house',
  livingroom: 'livingroom',
  sleepingroom: 'sleepingroom',
  kitchen: 'kitchen',
  lab: 'lab/',
  corridor: 'corridor',
  bathroom: 'bathroom',
  wc: 'wc'
};

var topic = {
  movement: 'movement',
  temperature: 'temperature',
  light: 'light',
  solar: 'solar',
  wind: 'wind',
  energy: 'energy'
};

var action = {
  state: 'state',
  on: 'on',
  off: 'off',
  lux: 'lux',
  celsius: 'celsius',
  watt: 'watt'
};

var pubsubsettings = {
  type: 'mqtt',
  json: false,
  mqtt: require('mqtt'),
  host: HOST,
  port: PORT
};

var message = {
  topic: 'broker/espruino/response',
  payload: 'Connected to mqtt broker.', // or a Buffer
  qos: 0, // 0, 1, or 2
  retain: false // or true
};

var server = new mosca.Server(pubsubsettings);

// fired when a message is received
server.on('published', function(packet, client) {
  var topicArray = packet.topic.split('/');
  if (topicArray[0] === device.espruino) {
    switch (topicArray[2]) {
      case topic.movement:
        console.log('movement espruino');
        var msg = packet.payload.toString();
        if (msg === movement.on) {
          lights.startStopLights(1, 3, state.on());
        } else if (msg === movement.off) {
          lights.startStopLights(1, 3, state.off());
        }
        break;
      case topic.temperature:
        var msg = packet.payload.toString();
        var msgArray = msg.split('/');

        console.log('Temperature', msgArray[0]);
        console.log('HUmidity', msgArray[1]);

        break;
      case topic.light:
        break;
    }
  }

  console.log('Topic', packet.topic);
  console.log('Published', packet.payload.toString());
});

server.on('subscribed', function(topic, client) {
  console.log("Topic :=", topic);
  console.log("Subscribed :=", client.packet);
});

// fired when a client connects
server.on('clientConnected', function(client) {
  console.log('Client Connected:', client.id);
  server.publish(message, function() {
    console.log('done!');
  });
});

// fired when a client disconnects
server.on('clientDisconnected', function(client) {
  console.log('Client Disconnected:', client.id);
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}
