var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var CorporateUserSchema = Schema({
  companyName: { type: String, required: true, unique: false },
  firstName: { type: String, required: false, unique: false },
  lastName: { type: String, required: false, unique: false },
  contactNumber: { type: String, required: true, unique: false },
  companyEmail: { type: String, required: true, unique: true },
  address: {
    address: { type: String, required: false, unique: false },
    zipcode: { type: String, required: false, unique: false },
    city: { type: String, required: false, unique: false },
    state: { type: String, required: false, unique: false },
    country: { type: String, required: false, unique: false },
  },
  employeeStrength: { type: String, required: false, unique: false },
  password: { type: String, required: true, unique: false },
  companyPic: { type: String, required: false, unique: false, default: "none" },
  recordedTime: {
    type: Date,
    required: false,
    unique: false,
    default: Date.now,
  },
  isEnable: { type: Boolean, required: false, unique: false, default: true },
  isApproved: { type: Boolean, required: false, unique: false, default: false },
  saltSecret: { type: String, required: false, unique: false },
});

module.exports = mongoose.model("CorporateUser", CorporateUserSchema);
