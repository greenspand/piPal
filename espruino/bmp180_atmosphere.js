I2C1.setup({scl:B6,sda:B7});
function start() {

        setTimeout(function(){
        var bmp = require("BMP085").connect(I2C1);
        setInterval(function() {
          bmp.getPressure(function(d) {
            console.log("Pressure: " + d.pressure + " Pa");
            console.log("Temperature: " + d.temperature + " C");
            console.log("Humidity: " + d.humidity + " %");
          });
          }, 1000);
        }, 5000);
}

//Store sketch on device flash, but first delete current contents from flash
E.on("init", start);
save();
