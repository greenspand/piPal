digitalWrite(B9, 1); // enable on Pico Shim V2

Serial2.setup(115200, {
  rx: A3,
  tx: A2
});

//MQTT SETUP
var device = {
  espruino: 'espruino/',
  duo: 'duo/'
};

var area = {
  house: 'house/',
  livingroom: 'livingroom/',
  lab: 'lab/',
  sleepingroom: 'sleepingroom/',
  kitchen: 'kitchen/',
  corridor: 'corridor/',
  bathroom: 'bathroom/',
  wc: 'wc/'
};

var topic = {
  movement: 'movement/',
  temperature: 'temperature/',
  light: 'light/',
  solar: 'solar/',
  wind: 'wind/',
  energy: 'energy/'
};

var action = {
  state: 'state/',
  on: 'on/',
  off: 'off/',
  lux: 'lux/',
  celsius: 'celsius/',
  rh: 'rh/',
  watt: 'watt/'
};

var config = {
  wifiSSID: 'Sorin_WLAN',
  wifiKey: '9334804578476971',
  mqttHost: '192.168.178.95',
  mqttPort: 8080
};

var mqttReconnect;

// stores the timeout used to turn lights off
var timeout;

var mqtt = require('MQTT').create(config.mqttHost);

function connectToMqttBroker() {
  console.log('creating client...');
  var client = require("net").connect({
    host: config.mqttHost,
    port: config.mqttPort,
    clean_session: config.mqttPort, // port number
    protocol_name: "MQTT", // or MQIsdp, etc..
    protocol_level: 4 // protocol_level
  }, function() { //'connect' listener
    console.log('client created');
    console.log('Connecting to MQTT server');
    mqtt.connect(client);
  });
}

function start() {
  var wifi = require('ESP8266WiFi_0v25').connect(Serial2, function(err) {
    if (err) {
      throw err;
    }
    wifi.reset(function(err) {
      if (err) {
        throw err;
      }
      console.log('Connecting to WiFi');
      wifi.connect(config.wifiSSID, config.wifiKey, function(err) {
        if (err) {
          throw err;
        }
        console.log('Wifi Connected');
        connectToMqttBroker();
        setTempSensor();

      });
    });
  });

  function setTempSensor() {
    setInterval(function() {
      var dht = require("DHT22").connect(B3);
      dht.read(function(a) {
        console.log("Temperature is " + a.temp.toString());
        console.log("Humidity is " + a.rh.toString());
        mqtt.publish(device.espruino + area.kitchen + topic.temperature,
          a.temp.toString() + "/" + a.rh.toString()
        );
      });
    }, 1000);
  }


  //MQTT callbacks
  mqtt.on('connected', function() {
    console.log('mqtt connected');
    // mqtt.subscribe("broker/espruino/response");

    if (mqttReconnect !== undefined) {
      clearTimeout(mqttReconnect);
      mqttReconnect = undefined;
    }
  });

  mqtt.on('publish', function(pub) {
    console.log("topic: " + pub.topic);
    console.log("message: " + pub.message);
  });

  mqtt.on('disconnected', function() {
    console.log('mqtt disconnected');
    mqtt.unsubscribe("broker/espruino/response");
    reconnectToMqttBroker();
  });
}

function reconnectToMqttBroker() {
  mqttReconnect = setInterval(function() {
    connectToMqttBroker();
  }, 4000);
}

//Store sketch on device flash, but first delete current contents from flash
E.on("init", start);
save();
