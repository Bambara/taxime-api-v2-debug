var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var AgentSchema = Schema({
    companyCode: {type: String, required: true, unique: true},
    companyName: {type: String, required: true, unique: false},
    companyType: {
        type: String,
        required: true,
        unique: false,
        enum: ["agent"],
        default: "agent",
    },
    agentLocation: {
        address: {type: String, required: false, unique: false},
        latitude: {type: Number, required: false, unique: false},
        longitude: {type: Number, required: false, unique: false},
    },
    agentContactNumber: {type: String, required: true, unique: false},
    agentEmail: {type: String, required: true, unique: false},
    ownerName: {type: String, required: true, unique: false},
    nic: {type: String, required: true, unique: false},
    password: {type: String, required: true, unique: false},
    address: {
        address: {type: String, required: true, unique: false},
        street: {type: String, required: true, unique: false},
        city: {type: String, required: true, unique: false},
        zipcode: {type: String, required: false, unique: false},
        country: {type: String, required: false, unique: false},
    },
    status: {
        type: String,
        required: true,
        unique: false,
        enum: ["active", "inactive"],
        default: "inactive",
    },
    isEnable: {type: Boolean, required: true, unique: false, default: true},
    isVerified: {type: Boolean, required: true, unique: false, default: true},
    isLoggedIn: {type: Boolean, required: false, unique: false},
    role: {type: String, required: true, unique: false, enum: ["agent"]},
    lastLogin: {type: Date, required: true, unique: false, default: Date.now},
    recordedTime: {
        type: Date,
        required: true,
        unique: false,
        default: Date.now,
    },
});

module.exports = mongoose.model("Agent", AgentSchema);
