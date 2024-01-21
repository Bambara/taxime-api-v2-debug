var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var ManualCustomerSchema = Schema({
  firstName: { type: String, required: false, unique: false },
  lastName: { type: String, required: false, unique: false },
  email: { type: String, required: false, unique: false },
  mobile: { type: String, required: false, unique: false },
  recordedTime: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
});

module.exports = mongoose.model("ManualCustomer", ManualCustomerSchema);
