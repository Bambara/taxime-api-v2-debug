var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AgentWalletSchema = Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  agentEarnings: { type: Number, required: false, unique: false, default: 0 },
  totalWalletPoints: {
    type: Number,
    required: false,
    unique: false,
    default: 0,
  },
  bonusAmount: { type: Number, required: false, unique: false, default: 0 },
  agentReferralCode: { type: String, required: false, unique: false },
  companyCode: { type: String, required: true, unique: true },
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
  promocode: [
    {
      promocode: { type: String, required: false, unique: false },
      validStartingDate: {
        type: Date,
        required: false,
        unique: false,
        default: new Date(),
      },
      validEndingDate: {
        type: Date,
        required: false,
        unique: false,
        default: new Date(),
      },
      recordedDate: {
        type: Date,
        required: false,
        unique: false,
        default: new Date(),
      },
      value: { type: Number, required: false, unique: false },
      isActive: { type: Boolean, required: false, unique: false },
    },
  ],
  rechargeHistory: [
    {
      dateTime: { type: Date, required: false, unique: false },
      amount: { type: Number, required: false, unique: false },
      method: { type: String, required: false, unique: false },
      description: { type: String, required: false, unique: false },
    },
  ],
});

module.exports = mongoose.model("AgentWallet", AgentWalletSchema);
