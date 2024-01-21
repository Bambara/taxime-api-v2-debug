var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var RoadPickupTripSchema = Schema({
  firstName: { type: String, required: false, unique: false },
  lastName: { type: String, required: false, unique: false },
  email: { type: String, required: false, unique: false },
  mobile: { type: String, required: false, unique: false },
  pickupLocation: {
    address: { type: String, required: false, unique: false },
    latitude: { type: Number, required: false, unique: false },
    longitude: { type: Number, required: false, unique: false },
  },
  dropLocation: {
    address: { type: String, required: false, unique: false },
    latitude: { type: Number, required: false, unique: false },
    longitude: { type: Number, required: false, unique: false },
  },
  pickupDateTime: {
    type: Date,
    required: false,
    unique: false,
    default: Date.now,
  },
  dropDateTime: { type: Date, required: false, unique: false },
  tripTime: { type: Number, required: false, unique: false },
  driverId: {
    type: mongoose.Schema.ObjectId,
    required: false,
    unique: false,
    default: null,
  },
  vehicleId: {
    type: mongoose.Schema.ObjectId,
    required: false,
    nuique: false,
    default: null,
  },
  distance: { type: Number, required: false, unique: false },
  totalCost: { type: Number, required: false, unique: false },
  waitingCost: { type: Number, required: false, unique: false },
  waitTime: { type: Number, required: false, unique: false },
  vehicleCategory: { type: String, required: false, unique: false },
  vehicleSubCategory: { type: String, required: false, unique: false },
  status: {
    type: String,
    required: false,
    unique: false,
    enum: ["default", "accepted", "canceled", "done", "ongoing"],
  },
  recordedTime: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
});

module.exports = mongoose.model("RoadPickupTrip", RoadPickupTripSchema);
