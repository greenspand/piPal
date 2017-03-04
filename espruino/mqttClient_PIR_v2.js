digitalWrite(B9, 1); // enable on Pico Shim V2

Serial2.setup(115200, {
  rx: A3,
  tx: A2
});

var topic = {
  movement: 'espruino/movement',
  temperature: 'espruino/temperature',
  light: 'espruino/light',
  broker : 'broker/espruino/response'
};


var config = {
  wifiSSID: 'Sorin_WLAN',
  wifiKey: '9334804578476971',
  mqttHost: '192.168.178.95',
  mqttPort: 8080
};

var ALERT_COOLDOWN = 10000;

// stores the timeout used to turn lights off
var id;
var lastAlertTimestamp;
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
        console.log('Connected');
        onConnected();
      });
    });
  });

  mqtt.on('connected', function() {
    console.log('mqtt connected');
    // mqtt.subscribe("broker/espruino/response");
  //onMovementDetected();
  startSurveillance();
  });
  
  function onMovementDetected(){
        // When the signal from the PIR changes...
        setWatch(function(e) {
          // If we had a timeout, it's because lights are already On.
          // clear it...
          if (id !== undefined) {
            clearTimeout(id);
          } else {
            mqtt.publish(topic.movement, 'ON');
          }
          // Now set a timeout to turn the lights off after 30 seconds
          id = setTimeout(function() {
          mqtt.publish(topic.movement, 'OFF');
            id = undefined;
          }, 30000);
        }, B1, {
          repeat: true,
          edge: "rising"
        });
  }

  // mqtt.on('publish', function(pub) {
  //   console.log("topic: " + pub.topic);
  //   console.log("message: " + pub.message);
  // });

  mqtt.on('disconnected', function() {
    console.log('mqtt disconnected');
    // mqtt.unsubscribe("broker/espruino/response");
    onConnected();
  });
}



function startSurveillance() {
  console.log("Start surveillance...");
  setWatch(function() {
    triggerAlert();
  }, B1, {
    repeat: true,
    edge: "rising"
  });

  setWatch(function() {
   mqtt.publish(topic.movement, 'OFF');
  }, B1, {
    repeat: true,
    edge: "falling"
  });
}

function triggerAlert() {
  var currentTimestamp = Date.now();
  if (lastAlertTimestamp === undefined ||
    lastAlertTimestamp + ALERT_COOLDOWN < currentTimestamp) {
    lastAlertTimestamp = currentTimestamp;
    var currentTime = new Date();
    mqtt.publish(topic.movement, 'OFF');
    console.log("Alert sent: " + currentTime.toString());
  }
}


//Store sketch on device flash, but first delete current contents from flash
E.on("init", start);
save();
