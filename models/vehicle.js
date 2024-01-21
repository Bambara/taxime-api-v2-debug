var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var VehicleSchema = Schema({
  vehicleCategory: { type: String, required: false, unique: false },
  vehicleSubCategory: { type: String, required: false, unique: false },
  ownerInfo: {
    ownerContactName: { type: String, required: false, unique: false },
    ownerContactNumber: { type: String, required: false, unique: false },
    ownerContactEmail: { type: String, required: false, unique: false },
    address: {
      address: { type: String, required: false, unique: false },
      street: { type: String, required: false, unique: false },
      zipcode: { type: Number, required: false, unique: false },

      country: { type: String, required: false, unique: false },
      province: { type: String, required: false, unique: false },
      district: { type: String, required: false, unique: false },
      city: { type: String, required: false, unique: false },
    },
    isVerify: { type: Boolean, required: false, unique: false, default: false },
  },
  isEnable: { type: Boolean, required: true, unique: false, default: true },
  isPackageDeliveryEnable: {
    type: Boolean,
    required: true,
    unique: false,
    default: false,
  },
  isPackageDeliveryBlocked: {
    type: Boolean,
    required: true,
    unique: false,
    default: true,
  },
  driverInfo: [
    {
      _id: false,
      driverId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        unique: false,
      },
      isEnableDriver: {
        type: Boolean,
        required: true,
        unique: false,
        default: false,
      },
    },
  ],
  vehicleBookPic: { type: String, required: false, unique: false },
  vehicleInsurancePic: { type: String, required: false, unique: false },
  vehicleFrontPic: { type: String, required: false, unique: false },
  vehicleSideViewPic: { type: String, required: false, unique: false },
  vehicleRevenuePic: { type: String, required: false, unique: false },
  vehicleRevenueNo: { type: String, required: false, unique: false },
  vehicleRevenueExpiryDate: { type: Date, required: false, unique: false },
  vehicleLicenceNo: { type: String, required: false, unique: false },
  vehicleRegistrationNo: { type: String, required: true, unique: true },
  vehicleColor: { type: String, required: false, unique: false },
  manufactureYear: { type: String, required: false, unique: false },
  vehicleBrandName: { type: String, required: true, unique: false },
  vehicleModel: { type: String, required: false, unique: false },
  weightLimit: { type: String, required: false, unique: false },
  passengerCapacity: { type: Number, required: false, unique: false },
  vehicleNo: { type: Number, required: false, unique: false, default: 0 },
  isApproved: { type: Boolean, required: true, unique: false },
  recordedTime: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
