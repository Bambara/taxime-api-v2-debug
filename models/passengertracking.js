var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var PassengerTrackingSchema = Schema({
  passengerId: { type: mongoose.Schema.ObjectId, required: true, unique: true },
  socketId: { type: String, required: true, unique: false },
  currentLocation: {
    address: { type: String, required: false, unique: false },
    latitude: { type: Number, required: false, unique: false },
    longitude: { type: Number, required: false, unique: false },
  },
  selectedVehicleCategory: { type: String, required: false, unique: false },
  selectedVehicleSubCategory: { type: String, required: false, unique: false },
  currentStatus: {
    type: String,
    required: true,
    unique: false,
    enum: ["onTrip", "uponCompletion", "default", "blocked", "disconnect"],
  },
  bidValue: { type: Number, required: false, unique: false },
});

module.exports = mongoose.model("PassengerTracking", PassengerTrackingSchema);
