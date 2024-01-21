var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var VehicleTrackingSchema = Schema({
  vehicleId: { type: mongoose.Schema.ObjectId, required: true, unique: false },
  driverId: { type: mongoose.Schema.ObjectId, required: true, unique: true },
  socketId: { type: String, required: true, unique: false },
  currentLocation: {
    address: { type: String, required: false, unique: false },
    latitude: { type: Number, required: false, unique: false },
    longitude: { type: Number, required: false, unique: false },
  },
  vehicleCategory: { type: String, required: true, unique: false },
  vehicleSubCategory: { type: String, required: true, unique: false },
  operationRadius: { type: Number, required: false, unique: false },
  driverInfo: {
    driverName: { type: String, required: false, unique: false },
    driverContactNumber: { type: String, required: false, unique: false },
  },
  vehicleInfo: {
    vehicleRegistrationNo: { type: String, required: false, unique: false },
    vehicleLicenceNo: { type: String, required: false, unique: false },
    vehicleColor: { type: String, required: false, unique: false },
    vehicleBrand: { type: String, required: false, unique: false },
  },
  currentStatus: {
    type: String,
    required: true,
    unique: false,
    enum: [
      "onTrip",
      "arrived",
      "uponCompletion",
      "online",
      "offline",
      "blocked",
      "goingToPickup",
      "disconnect",
    ],
  },
  distanceBetween: {
    type: Number,
    required: false,
    unique: false,
    default: null,
  },
  categoryTripCount: { type: Number, required: false, unique: false },
  bidValue: { type: Number, required: false, unique: false },
  lastbidUpdatedDate: { type: Date, required: false, unique: false },
  tripCountForBid: { type: Number, required: false, unique: false },
  driverPic: { type: String, required: false, unique: false }, // **** new ****
  subCategoryIcon: {
    type: String,
    required: false,
    unique: false,
    default: null,
  }, // **** new ****
  subCategoryIconSelected: {
    type: String,
    required: false,
    unique: false,
    default: null,
  }, // **** new ****
  mapIcon: { type: String, required: false, unique: false, default: null }, // **** new ****
  mapIconOffline: {
    type: String,
    required: false,
    unique: false,
    default: null,
  }, // **** new ****
  mapIconOntrip: {
    type: String,
    required: false,
    unique: false,
    default: null,
  }, // **** new ****
  subCategoryIconSVG: {
    type: String,
    required: false,
    unique: false,
    default: null,
  }, // **** new ****
  subCategoryIconSelectedSVG: {
    type: String,
    required: false,
    unique: false,
    default: null,
  }, // **** new ****
  mapIconSVG: { type: String, required: false, unique: false, default: null }, // **** new ****
  mapIconOfflineSVG: {
    type: String,
    required: false,
    unique: false,
    default: null,
  }, // **** new ****
  mapIconOntripSVG: {
    type: String,
    required: false,
    unique: false,
    default: null,
  },
  totalWalletPoints: { type: Number, required: false, unique: false },
});

module.exports = mongoose.model("VehicleTracking", VehicleTrackingSchema);
