var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var DriverNotificationSchema = Schema({
  driverId: { type: mongoose.Schema.ObjectId, required: true, unique: false },
  notifications: [
    {
      discription: { type: String, required: false, unique: false },
      notification: { type: Object, required: false, unique: false },
      isChecked: { type: Boolean, required: false, unique: false },
      recordedTime: {
        type: Date,
        required: false,
        unique: false,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("DriverNotification", DriverNotificationSchema);
