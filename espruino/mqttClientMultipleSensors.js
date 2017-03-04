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
  state: 'state',
  on: 'on',
  off: 'off',
  lux: 'lux',
  celsius: 'celsius',
  watt: 'watt'
};

var config = {
  wifiSSID: 'Sorin_WLAN',
  wifiKey: '9334804578476971',
  mqttHost: '192.168.178.95',
  mqttPort: 8080
};

// stores the timeout used to turn lights off
var timeout;

var mqtt = require('MQTT').create(config.mqttHost);

function onConnected() {
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
        onConnected();
        setTempSensor();

      });
    });
  });

  function setMovementSensor() {
    // When the signal from the PIR changes...
    setWatch(function(e) {
      // If we had a timeout, it's because lights are already On.
      // clear it...
      if (timeout !== undefined)
        clearTimeout(timeout);
      else
        mqtt.publish(device.espruino + area.house + topic.movement, action.on);
      // Now set a timeout to turn the lights off after 30 seconds
      timeout = setTimeout(function() {
        mqtt.publish(device.espruino + area.house + topic.movement,
          action.off);
        timeout = undefined;
      }, 2000);
    }, B1, {
      repeat: true,
      edge: "rising"
    });
  }

  function setLightSensor() {
    I2C1.setup({
      scl: B6,
      sda: B7
    });
    var bh = require("BH1750").connect(I2C1, 0);
    bh.start(2, 0);

    function lux() {
      var luxx = bh.read();
      console.log("lux=", luxx);
    }
    setInterval(lux, 1000);
  }


  function setTempSensor() {
    setInterval(function() {
      var dht = require("DHT22").connect(B3);
      dht.read(function(a) {
        console.log("Temperature is " + a.temp.toString());
        console.log("Humidity is " + a.rh.toString());
        mqtt.publish(device.espruino + area.house + topic.temperature,
          action.celsius + a.temp.toString);
      });
    }, 1000);
  }


  function startUltrasonic() {
    // Ultrasonic setup
    var sensor = require("HC-SR04").connect(B8, B9, function(dist) {
      console.log(dist + " cm away");
      if (dist < 10) {
        mqtt.publish(device.espruino + area.house + topic.movement,
          action.on);
      } else {
        mqtt.publish(device.espruino + area.house + topic.movement,
          action.off);
      }
    });
    setInterval(function() {
      sensor.trigger(); // send pulse
    }, 500);
  }

  //MQTT callbacks
  mqtt.on('connected', function() {
    console.log('mqtt connected');
    mqtt.subscribe("broker/espruino/response");
  });

  mqtt.on('publish', function(pub) {
    console.log("topic: " + pub.topic);
    console.log("message: " + pub.message);
  });

  mqtt.on('disconnected', function() {
    console.log('mqtt disconnected');
    mqtt.unsubscribe("broker/espruino/response");
    onConnected();
  });
}


//Store sketch on device flash, but first delete current contents from flash
E.on("init", start);
save();
