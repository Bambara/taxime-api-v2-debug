var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var SettingSchema = Schema({
  androidAppVersion: {
    type: Number,
    required: false,
    unique: false,
    default: 0,
  },
  androidUserAppVersion: {
    type: Number,
    required: false,
    unique: false,
    default: 0,
  },
  iosUserAppVersion: {
    type: String,
    required: false,
    unique: false,
    default: 0,
  },
  lastUpdatedDate: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
});

module.exports = mongoose.model("Setting", SettingSchema);
