var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var DriverSchema = Schema({
  firstName: { type: String, required: true, unique: false },
  lastName: { type: String, required: true, unique: false },
  email: { type: String, required: true, unique: false },
  nic: { type: String, required: true, unique: false },
  birthday: { type: Date, required: true, unique: false },
  otpPin: { type: Number, required: false, unique: false, default: 0 },
  otpTime: { type: Date, required: false, unique: false, default: Date.now },
  mobile: { type: String, required: true, unique: false },
  gender: { type: String, required: true, unique: false },
  address: {
    address: { type: String, required: false, unique: false },
    street: { type: String, required: false, unique: false },
    zipcode: { type: String, required: false, unique: false },
    country: { type: String, required: false, unique: false },
    province: { type: String, required: false, unique: false },
    district: { type: String, required: false, unique: false },
    city: { type: String, required: false, unique: false },
  },
  driverPic: { type: String, required: false, unique: false },
  nicFrontPic: { type: String, required: false, unique: false },
  nicBackPic: { type: String, required: false, unique: false },
  drivingLicenceFrontPic: { type: String, required: false, unique: false },
  drivingLicenceBackPic: { type: String, required: false, unique: false },
  isEnable: { type: Boolean, required: true, unique: false, default: true },
  emailConfirm: {
    type: Boolean,
    required: true,
    unique: false,
    default: false,
  },
  contactNoConfirm: {
    type: Boolean,
    required: true,
    unique: false,
    default: false,
  },
  isApproved: { type: Boolean, required: true, unique: false, default: false },

  lifeInsuranceNo: { type: String, required: false, unique: false },
  lifeInsuranceExpiryDate: { type: Date, required: false, unique: false },
  lifeInsuranceAmount: { type: Number, required: false, unique: false },

  packageType: {
    type: String,
    required: false,
    unique: false,
    default: "commission",
    enum: ["commission", "subscription"],
  },
  isDispatchEnable: {
    type: Boolean,
    required: false,
    unique: false,
    default: false,
  },
  company: { type: String, required: false, unique: false, default: "Taxime" },
  saltSecret: { type: String, required: false, unique: false },
  maxBidChangingCount: {
    type: Number,
    required: false,
    unique: false,
    default: 0,
  },
  bidValue: { type: Number, required: false, unique: false },
  lastbidUpdatedDate: { type: Date, required: false, unique: false },
  tripCountForBid: { type: Number, required: false, unique: false },
  driverCode: { type: String, required: false, unique: false, default: null },
  companyCode: {
    type: String,
    required: false,
    unique: false,
    default: "TAXIME",
  },
  recordedTime: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
  ratings: [
    {
      rate: { type: Number, required: true, unique: false, default: null },
      feedback: { type: String, required: false, unique: false },
    },
  ],
  pushToken: { type: String, required: false, unique: false, default: null },
  accNumber: { type: String, required: true, unique: false },
});

module.exports = mongoose.model("Driver", DriverSchema);
