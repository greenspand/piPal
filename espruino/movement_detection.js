digitalWrite(B9, 1); // enable on Pico Shim V2

//what we send to the server
var dataSet = ["0", "hard", "core"];
//http and wifi config.
var http = require("http");
var network = "Sorin_WLAN";
var password = "9334804578476971";
// stores the timeout used to turn lights off
var timeout;

function start() {

  try {
    Serial2.setup(9600, {
      rx: A3,
      tx: A2
    });
    console.log("Init wifi module...");
    var wifi = require("ESP8266WiFi").connect(Serial2, function(err) {
      if (err) throw err;
      wifi.getVersion(function(err, version) {
        console.log("WiFi chip version: " + version);
      });

      wifi.reset(function(err) {
        if (err) throw err;
        console.log("Connecting to WiFi");
        wifi.connect(network, password, function(err) {
          if (err) throw err;

          console.log("Connected");
          startSurveillance();
        });
      });
    });
} catch (err) {
  flashErrorLED();
  console.log(err);
}
}
function enableMovementDetectedLED() {
  digitalWrite(LED2, 1);
}

function disableMovementDetectedLED() {
  digitalWrite(LED2, 0);
}

function flashSurveillanceStartedLED() {
  var intervalId = setInterval("digitalWrite(LED2,l=!l);", 200);
  setTimeout(function() {
    clearInterval(intervalId);
    digitalWrite(LED2, 0);
  }, 2000);
}

function flashErrorLED() {
  setInterval("digitalWrite(LED1,l=!l);", 200);
}


function startSurveillance() {
  console.log("Start surveillance...");
  flashSurveillanceStartedLED();

  setWatch(function() {
    enableMovementDetectedLED();
    triggerAlert();
  }, B1, {
    repeat: true,
    edge: "rising"
  });

  setWatch(function() {
    dataSet[0] = "0";
    postSample(dataSet);
    disableMovementDetectedLED();
  }, B1, {
    repeat: true,
    edge: "falling"
  });
}


var lastAlertTimestamp;

function triggerAlert() {
  var currentTimestamp = Date.now();

  if (lastAlertTimestamp === undefined ||
    lastAlertTimestamp + ALERT_COOLDOWN < currentTimestamp) {
    lastAlertTimestamp = currentTimestamp;

    var currentTime = new Date();

    dataSet[0] = "1";
    postSample(dataSet);

    console.log("Alert sent: " + currentTime.toString());
    flashAlertSentLED();
  }
}


// Wrapper function of "http.request" to execute POST request.
function postSample(payload) {

  var queryString =
    "Espruino_WC:" +
    "movement:" + payload[0] +
    ":temperature:" + payload[1] +
    ":humidity:" + payload[2];

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
