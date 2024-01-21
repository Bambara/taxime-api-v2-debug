var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var PromotionSchema = Schema({
  name: { type: String, required: true, unique: true },
  promoFor: {
    type: String,
    required: true,
    unique: false,
    enum: ["driver", "passenger", "agent"],
    default: "passenger",
  },
  promocode: { type: String, required: true, unique: true },
  commission: { type: Number, required: true, unique: false, default: 0 },
  isEnable: { type: Boolean, required: false, unique: false, default: true },
  modifiedTime: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
  recordedTime: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now,
  },
});

module.exports = mongoose.model("Promotion", PromotionSchema);
