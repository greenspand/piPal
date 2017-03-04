digitalWrite(B9,1); // enable on Pico Shim V2
Serial2.setup(115200, { rx: A3, tx : A2 });
var wifi = require("ESP8266WiFi_0v25").connect(Serial2, function(err) {
  if (err) throw err;
  wifi.reset(function(err) {
    if (err) throw err;
    console.log("Connecting to WiFi");
    wifi.connect("Sorin_WLAN","9334804578476971", function(err) {
      if (err) throw err;
      console.log("Connected");
      setInterval(function(){
      console.log('WIFI Connected, starting http get interval.');
      // Now you can do something, like an HTTP request
      require("http").get("http://www.pur3.co.uk/hello.txt", function(res) {
        console.log("Response: ",res);
        res.on('data', function(d) {
          console.log("--->"+d);
        });
      });
    });
   }, 10000);
  });
});
