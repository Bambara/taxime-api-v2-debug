var rn = require("random-number");

exports.imagename = function () {
  console.log("### generating randno ###");
  var options = {
    min: 100000000000,
    max: 100000000000000000,
    integer: true,
  };
  var abc = rn(options);
  return abc;
};

exports.otpGen = function () {
  var options = {
    min: 1000,
    max: 9999,
    integer: true,
  };
  var otp = rn(options);
  return otp;
};

exports.rndNo = function () {
  var options = {
    min: 5,
    max: 10,
    integer: true,
  };
  var otp = rn(options);
  return otp;
};

exports.generateRefToken = function () {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;

  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);

  return (firstPart + secondPart).toUpperCase();
};
