var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var DispatcherWalletSchema = Schema({
    dispatcherId: {type: mongoose.Schema.Types.ObjectId, required: true, unique: true},
    dispatcherType: {type: String, required: false, unique: false, enum: ["Driver", "User", "Admin"]},
    bonusAmount: {type: Number, required: false, unique: false, default: 0},
    totalWalletPoints: {type: Number, required: false, unique: false, default: 0},
    dispatcherEarnings: {type: Number, required: false, unique: false, default: 0},
    adminEarnings: {type: Number, required: false, unique: false, default: 0},
    driverReferralCode: {type: String, required: false, unique: false},
    devices: {
        totalDevicesInstallmentInDue: {type: Number, required: false, unique: false},
        deviceDailyDeduction: {type: Number, required: false, unique: false},
        deviceDueStartDate: {type: Date, required: false, unique: false},
    },
    transactionHistory: [
        {
            dateTime: {type: Date, required: false, unique: false},
            transactionAmount: {type: Number, required: false, unique: false},
            transactionType: {type: String, required: false, unique: false, enum: ["trip", "roadPickup", "dispatch", "other"]},
            isATrip: {type: Boolean, required: false, unique: false},
            isCredited: {type: Boolean, required: false, unique: false},
            method: {type: String, required: false, unique: false, enum: ["money", "card"]},
            discription: {type: String, required: false, unique: false},
            trip: {
                tripId: {type: mongoose.Schema.Types.ObjectId, required: true, unique: false},
                tripEarning: {type: Number, required: false, unique: false},
                tripAdminCommission: {type: Number, required: false, unique: false},
                totalTripValue: {type: Number, required: false, unique: false},
                pickupLocation: {
                    address: {type: String, required: true, unique: false},
                    latitude: {type: Number, required: true, unique: false},
                    longitude: {type: Number, required: true, unique: false},
                },
                destinations: [
                    {
                        address: {type: String, required: true, unique: false},
                        latitude: {type: Number, required: true, unique: false},
                        longitude: {type: Number, required: true, unique: false},
                    },
                ],
            },
        },
    ],
    referral: [
        {
            referralId: {type: mongoose.Schema.Types.ObjectId, required: true, unique: false},
            referredDriverId: {type: mongoose.Schema.Types.ObjectId, required: true, unique: false},
            earning: {type: Number, required: false, unique: false},
            recordedDate: {type: Date, required: false, unique: false},
        },
    ],
    promocode: [
        {
            promocode: {type: String, required: false, unique: false},
            validStartingDate: {type: Date, required: false, unique: false},
            validEndingDate: {type: Date, required: false, unique: false},
            recordedDate: {type: Date, required: false, unique: false},
            value: {type: Number, required: false, unique: false},
            isActive: {type: Boolean, required: false, unique: false},
        },
    ],
});

module.exports = mongoose.model("DispatcherWallet", DispatcherWalletSchema);
