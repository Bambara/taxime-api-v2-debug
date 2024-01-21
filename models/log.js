var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var LogSchema = Schema({
  uId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: false },
  module: { type: String, required: true, unique: false },
  for: { type: String, required: true, unique: false },
  action: { type: String, required: true, unique: false },
  data: { type: String, required: true, unique: false },
  recordedDate: { type: Date, required: false, unique: false },
});

module.exports = mongoose.model("AdminLog", LogSchema);
