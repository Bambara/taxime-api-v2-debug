var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var DispatcherNotificationSchema = Schema({
  dispatcherId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: false,
  }, //driver id
  dispatcherType: { type: String, required: false, unique: false },
  notificationType: { type: String, required: false, unique: false },
  discription: { type: String, required: false, unique: false },
  notification: { type: Object, required: false, unique: false },
  isChecked: { type: Boolean, required: false, unique: false, default: false },
  recordedTime: {
    type: Date,
    required: false,
    unique: false,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "DispatcherNotification",
  DispatcherNotificationSchema
);
