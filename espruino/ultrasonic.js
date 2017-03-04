//Setup for ESP8266WiFi_0v25
digitalWrite(B9, 1); // enable on Pico Shim V2
Serial2.setup(115200, {
  rx: A3,
  tx: A2
});

//Ultrasonic setup
var sensor = require("HC-SR04").connect(B7, A8, function(dist) {
  console.log(dist + " cm away");
});
//what we send to the server
var dataSet = ["0"];
//http and wifi config.
var http = require("http");
var network = "Sorin_WLAN";
var password = "9334804578476971";
// stores the timeout used to turn lights off


function start() {
       setInterval(function() {
          sensor.trigger(); // send pulse
        }, 700);
  var wifi = require("ESP8266WiFi_0v25").connect(Serial2, function(err) {
    if (err) throw err;
    wifi.reset(function(err) {
      if (err) throw err;
      console.log("Connecting to WiFi");
      wifi.connect(network, password, function(err) {
        if (err) throw err;
        console.log("Connected");
      });
    });
  });
}

// Wrapper function of "http.request" to execute POST request.
function postSample(payload) {

  var queryString =
    "Espruino_LIVING:" +
    "lux:" + payload[0];

  var host = "192.168.178.95";
  var port = 8080;
  var path = "/";
  var options = {
    host: host,
    port: port,
    path: path
  };

  post(http, options, queryString, function(chunk) {
    console.log('BODY: ' + chunk);
  });
}

// Wrapper function of "http.request" to execute POST request.
function post(http, options, queryString, callback) {
  // complete the options
  options.headers = options.headers || {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': queryString.length
  };
  options.method = "POST";

  var dataAsString = "";
  var req = http.request(options, function(res) {
    res.on('data', function(data) {
      dataAsString += data;
    });
    res.on('close', function() {
      callback(dataAsString);
    });
  });
  req.write(queryString);
  req.end();
}
//Store sketch on device flash, but first delete current contents from flash
E.on("init", start);
save();
