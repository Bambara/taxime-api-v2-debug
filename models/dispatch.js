var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var VehicleTracking = require("./vehicletracking");
var Schema = mongoose.Schema;

var VTrackSchema = Schema({
  vehicleId: { type: mongoose.Schema.ObjectId, required: true, unique: false },
  driverId: { type: mongoose.Schema.ObjectId, required: true, unique: false },
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
  },
  currentStatus: {
    type: String,
    required: true,
    unique: false,
    enum: [
      "onTrip",
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
  bidValue: { type: Number, required: false, unique: false },
  lastbidUpdatedDate: { type: Date, required: false, unique: false },
  tripCountForBid: { type: Number, required: false, unique: false },
});

var DispatchSchema = Schema({
  dispatcherId: {
    type: mongoose.Schema.ObjectId,
    required: false,
    unique: false,
  },
  customerName: { type: String, required: false, unique: false },
  customerTelephoneNo: { type: String, required: false, unique: false },
  assignedDriverId: {
    type: mongoose.Schema.ObjectId,
    required: false,
    unique: false,
    default: null,
  },
  assignedVehicleId: {
    type: mongoose.Schema.ObjectId,
    required: false,
    nuique: false,
    default: null,
  },
  noOfPassengers: { type: Number, required: false, unique: false },
  pickupDateTime: {
    type: Date,
    required: false,
    unique: false,
    default: Date.now,
  },
  dropDateTime: { type: Date, required: false, unique: false },
  tripTime: { type: Number, required: false, unique: false },
  pickupLocation: {
    address: { type: String, required: true, unique: false },
    latitude: { type: Number, required: true, unique: false },
    longitude: { type: Number, required: true, unique: false },
  },
  realDropLocation: {
    address: { type: String, required: false, unique: false },
    latitude: { type: Number, required: false, unique: false },
    longitude: { type: Number, required: false, unique: false },
  },
  realPickupLocation: {
    address: { type: String, required: false, unique: false },
    latitude: { type: Number, required: false, unique: false },
    longitude: { type: Number, required: false, unique: false },
  },
  dropLocations: [
    {
      address: { type: String, required: false, unique: false },
      latitude: { type: Number, required: false, unique: false },
      longitude: { type: Number, required: false, unique: false },
    },
  ],
  distance: { type: Number, required: false, unique: false },
  bidValue: { type: Number, required: false, unique: false },
  vehicleCategory: { type: String, required: false, unique: false },
  vehicleSubCategory: { type: String, required: false, unique: false },
  hireCost: { type: Number, required: false, unique: false },
  totalPrice: { type: Number, required: false, unique: false, default: 0 },
  waitingCost: { type: Number, required: false, unique: false, default: 0 },
  discount: { type: Number, required: false, unique: false, default: 0 },
  waitTime: { type: Number, required: false, unique: false, default: 0 },
  notes: { type: String, required: false, unique: false },
  type: {
    type: String,
    required: true,
    unique: false,
    enum: ["driverDispatch", "userDispatch", "adminDispatch"],
  },
  cancelCount: { type: Number, required: false, unique: false },
  cancelDetails: [
    {
      cancelReason: { type: String, required: false, unique: false },
      canceledDriverId: {
        type: mongoose.Schema.ObjectId,
        required: false,
        unique: false,
      },
    },
  ],
  tripType: {
    type: String,
    required: false,
    unique: false,
    enum: ["current", "prebooking", "longtrip"],
  },
  noifiedDrivers: [{ type: VTrackSchema, required: false, unique: false }],
  status: {
    type: String,
    required: false,
    unique: false,
    enum: ["default", "accepted", "arrived", "onTrip", "canceled", "done"],
  },
  validTime: { type: Number, required: false, unique: false, default: 45 },
  recordedTime: {
    type: Date,
    required: false,
    unique: false,
    default: Date.now,
  },
});

module.exports = mongoose.model("Dispatch", DispatchSchema);
