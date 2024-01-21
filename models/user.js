var mongoose = require("mongoose");
// var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var UserSchema = Schema({
    name: {type: String, required: false, unique: false},
    email: {type: String, required: false, unique: false},
    birthday: {type: String, required: false, unique: false, default: null},
    nic: {type: String, required: false, unique: false, default: null},
    gender: {type: String, required: false, unique: false, default: "male"},
    contactNumber: {
        type: String,
        required: true,
        unique: true,
        default: "none",
    },
    address: [
        {
            address: {type: String, required: false, unique: false},
            zipcode: {type: String, required: false, unique: false},
            city: {type: String, required: false, unique: false},
            state: {type: String, required: false, unique: false},
            country: {type: String, required: false, unique: false},
        },
    ],
    favouriteLocations: [
        {
            favourName: {type: String, required: true, unique: false},
            address: {type: String, required: true, unique: false},
            latitude: {type: Number, required: true, unique: false},
            longitude: {type: Number, required: true, unique: false},
        },
    ],
    enableUser: {type: Boolean, required: false, unique: false, default: true},
    socialLoginId: {type: String, required: false, unique: false},
    userPlatform: {
        type: String,
        required: false,
        unique: false,
        enum: ["iOS", "android", "web"],
    },
    userType: {
        type: String,
        required: false,
        unique: false,
        default: "standard",
        enum: ["standard", "facebook", "google"],
    },
    userProfilePic: {
        type: String,
        required: false,
        unique: false,
        default: "none",
    },
    recordedTime: {
        type: Date,
        required: false,
        unique: false,
        default: Date.now,
    },
    isEnable: {type: Boolean, required: false, unique: false, default: true},
    isApproved: {type: Boolean, required: false, unique: false, default: false},
    isDispatchEnable: {
        type: Boolean,
        required: false,
        unique: false,
        default: false,
    },
    otpPin: {type: Number, required: false, unique: false},
    otpTime: {type: Date, required: false, unique: false},
    contactNoConfirm: {
        type: Boolean,
        required: false,
        unique: false,
        default: false,
    },
    bidValue: {type: Number, required: false, unique: false},
    ratings: [
        {
            rate: {type: Number, required: true, unique: false, default: 0},
            feedback: {type: String, required: false, unique: false},
        },
    ],
    payment: {
        type: {
            type: String,
            required: true,
            unique: false,
            default: "cash",
            enum: ["card", "cash"],
        },
        cardId: {type: String, required: false, unique: false, default: null},
    },
    pushToken: {type: String, required: false, unique: false, default: null},
    passengerCode: {
        type: String,
        required: false,
        unique: false,
        default: null,
    },
});

module.exports = mongoose.model("User", UserSchema);
