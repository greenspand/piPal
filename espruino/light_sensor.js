
function start() {
//Light sensor I2C Bus setup
I2C1.setup({
  scl: B7,
  sda: B6
});
var bh = require("BH1750").connect(I2C1);
var resolution = 2;
var oneTime = 1;
  
        setInterval(function() {
          bh.start(resolution, oneTime);
          setTimeOut(function() {
           console.log("lux "+ bh.read());
          }, 1000);
        }, 2000);

}
//Store sketch on device flash, but first delete current contents from flash
E.on("init", start);
save();
