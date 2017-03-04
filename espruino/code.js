var wlan = require("CC3000").connect();
wlan.connect("Sorin_WLAN","9334804578476971", function (s) {
  if (s=="dhcp") {
    console.log("My IP is "+wlan.getIP().ip);
    require("http").createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write('Hello World');
      res.end();
    }).listen(80);
  }
});