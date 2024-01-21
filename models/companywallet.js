var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var CompanyWalletSchema = Schema({
  adminEarnings: { type: Number, required: false, unique: false, default: 0 },
  companyName: { type: String, required: true, unique: false },
  companyCode: { type: String, required: true, unique: true },
  companyType: {
    type: String,
    required: true,
    unique: false,
    enum: ["master", "agent"],
    default: "agent",
  },
  companyLocation: {
    address: { type: String, required: false, unique: false },
    latitude: { type: Number, required: false, unique: false },
    longitude: { type: Number, required: false, unique: false },
  },
  companyContactNumber: { type: String, required: false, unique: false },
  companyEmail: { type: String, required: false, unique: false },
  transactionHistory: [
    {
      dateTime: { type: Date, required: false, unique: false },
      transactionAmount: { type: Number, required: false, unique: false },
      transactionType: {
        type: String,
        required: false,
        unique: false,
        enum: ["trip", "roadPickup", "dispatch", "other"],
      },
      isATrip: { type: Boolean, required: false, unique: false },
      isCredited: { type: Boolean, required: false, unique: false },
      method: {
        type: String,
        required: false,
        unique: false,
        enum: ["cash", "card"],
      },
      trip: {
        tripId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          unique: false,
        },
        tripEarning: { type: Number, required: false, unique: false },
        tripAdminCommission: { type: Number, required: false, unique: false },
        totalTripValue: { type: Number, required: false, unique: false },
        pickupLocation: {
          address: { type: String, required: true, unique: false },
          latitude: { type: Number, required: true, unique: false },
          longitude: { type: Number, required: true, unique: false },
        },
        destinations: [
          {
            address: { type: String, required: true, unique: false },
            latitude: { type: Number, required: true, unique: false },
            longitude: { type: Number, required: true, unique: false },
          },
        ],
      },
    },
  ],
});

module.exports = mongoose.model("CompanyWallet", CompanyWalletSchema);
