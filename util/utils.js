module.exports = {
  checkIfDefined: function(info) {
    if (typeof info !== "undefinded") {
      return true;
    } else {
      return false;
    }
  },
  lightsOnHour: function(calendar) {
    var month = calendar.getUTCMonth() + 1; //months from 1-12
    var day = calendar.getUTCDate();
    var year = calendar.getUTCFullYear();
    if (month > 10) {
      return 16;
    } else if (month > 5 && month <= 10) {
      return 19;
    }
  }
};
