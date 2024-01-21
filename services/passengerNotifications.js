"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const asyncHandler = require("express-async-handler");

require("dotenv").config();
// const config = require("../config");
// var Driver = require("../models/driver");

const BASE_URL = process.env.BASE_URL;
const PASSENGER_PORT = process.env.PASSENGER_PORT;

const socket = require("socket.io-client")(BASE_URL + ":" + PASSENGER_PORT);

app.use(cors());
router.use(cors());

//support on x-www-form-urlencoded
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// exports.driverRegToAdmin = function (req) {
//     console.log('notify')
//     socket.emit('newDriver', req);
// };

// exports.driverStatus = function (req) {
//     console.log('driver state')
//     socket.emit('driverConnect', req);
// };

exports.sendDriverDetailsToPassenger = asyncHandler(function (req) {
    console.log("sending driver details to passenger socket!");
    socket.emit("TripDetails", req);
});

exports.sendTripCancelToPassenger = asyncHandler(function (req) {
    console.log("sending trip cancel to passenger socket!");
    socket.emit("TripCancel", req);
});

exports.sendTripEndDetailsToPassenger = asyncHandler(function (req) {
    console.log("sending trip end to passenger socket!");
    socket.emit("EndTrip", req);
});

exports.sendTripPaymentToPassenger = asyncHandler(function (req) {
    console.log("sending trip payment to passenger socket : " + req.passengerSocket);
    socket.emit("requestTripPayment", req);
});
