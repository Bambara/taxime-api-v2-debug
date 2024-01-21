var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var DispatcherSchema = Schema({
  type: {
    type: String,
    required: true,
    unique: false,
    enum: ["Driver", "User"],
  },
  dispatcherId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    refPath: "type",
    unique: true,
  },
  dispatchPackageType: {
    type: String,
    required: false,
    unique: false,
    default: "commission",
    enum: ["commission", "subscription"],
  },
  isEnable: { type: Boolean, required: false, unique: false, default: true },
  commission: {
    dispatcherCommission: {
      type: Number,
      required: false,
      unique: false,
      default: 0,
    },
    dispatchAdminCommission: {
      type: Number,
      required: false,
      unique: false,
      default: 0,
    },
    fromDate: { type: Date, required: true, unique: false },
    toDate: { type: Date, required: true, unique: false },
  },
  dispatcherCode: { type: String, required: true, unique: false },
  recordedTime: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
});

module.exports = mongoose.model("Dispatcher", DispatcherSchema);
