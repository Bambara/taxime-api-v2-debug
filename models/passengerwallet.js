const mongoose = require("mongoose");
// const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema;

const PassengerWalletSchema = Schema({
    passengerId: {
        type: mongoose.Schema.Types.ObjectId, required: true, unique: true
    },
    bonusAmount: {type: Number, required: false, unique: false, default: 0},
    totalWalletPoints: {type: Number, required: false, unique: false, default: 0},
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
            transactionType: {type: String, required: false, unique: false, enum: ["trip", "other"]},
            isATrip: {type: Boolean, required: false, unique: false},
            isCredited: {type: Boolean, required: false, unique: false},
            method: {type: String, required: false, unique: false, enum: ["money", "card"]},
            discription: {type: String, required: false, unique: false},
            trip: {
                tripId: {type: mongoose.Schema.Types.ObjectId, required: true, unique: false},
                tripCost: {type: Number, required: false, unique: false},
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
            referralId: {type: String, required: true, unique: false},
            referredDriverId: {type: mongoose.Schema.Types.ObjectId, required: true, unique: false},
            referredId: {type: mongoose.Schema.Types.ObjectId, required: true, unique: false},
            referredType: {
                type: String,
                required: true,
                unique: false,
                enum: ["driver", "userDispatcher", "driverDispatcher", "passenger"]
            },
            earning: {type: Number, required: false, unique: false},
            recordedDate: {type: Date, required: false, unique: false, default: new Date()},
            expireDate: {type: Date, required: false, unique: false},
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
    card: {
        type: {type: String, required: false, unique: false},
        number: {type: String, required: false, unique: true},
        month: {type: String, required: false, unique: false},
        year: {type: String, required: false, unique: false},
        csv_code: {type: String, required: false, unique: false},
        owner_name: {type: String, required: false, unique: false},
    }
});

module.exports = mongoose.model("PassengerWallet", PassengerWalletSchema);
