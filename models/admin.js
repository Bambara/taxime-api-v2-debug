const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const config = require("../config");

require("dotenv").config();

const AdminSchema = Schema({
  firstName: { type: String, required: true, unique: false },
  lastName: { type: String, required: true, unique: false },
  email: { type: String, required: true, unique: false },
  nic: { type: String, required: true, unique: false },
  birthday: { type: String, required: true, unique: false },
  password: { type: String, required: true, unique: false },
  mobile: { type: String, required: true, unique: false },
  gender: { type: String, required: true, unique: false },
  address: {
    address: { type: String, required: true, unique: false },
    street: { type: String, required: true, unique: false },
    city: { type: String, required: true, unique: false },
    zipcode: { type: String, required: false, unique: false },
    country: { type: String, required: false, unique: false },
  },
  role: {
    type: String,
    required: true,
    unique: false,
    enum: ["super", "operation", "finance", "dispatch", "generic", "agent"],
  },
  companyCode: {
    type: String,
    required: true,
    default: process.env.MASTER_COMPANY,
  },
  companyName: {
    type: String,
    required: true,
    unique: false,
    default: process.env.MASTER_COMPANY,
  },
  companyType: {
    type: String,
    required: true,
    unique: false,
    enum: ["master", "agent"],
    default: "agent",
  },
  isEnable: { type: Boolean, required: true, unique: false, default: true },
  isVerified: { type: Boolean, required: true, unique: false, default: true },
  isLoggedIn: { type: Boolean, required: false, unique: false, default: false },
  lastLogin: { type: Date, required: true, unique: false, default: Date.now },
  recordedTime: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
});

module.exports = mongoose.model("Admin", AdminSchema);
