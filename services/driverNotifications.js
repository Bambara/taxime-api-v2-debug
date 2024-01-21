"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const asyncHandler = require("express-async-handler");
require("dotenv").config();
// const config = require("../config");
// const Driver = require("../models/driver");

const BASE_URL = process.env.BASE_URL;
const DRIVER_PORT = process.env.DRIVER_PORT;

const socket = require("socket.io-client")(BASE_URL + ":" + DRIVER_PORT);

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

exports.sendLiveTripToDriver = asyncHandler(async function (req) {
    console.log("sending live trip to driver socket!");
    await socket.emit("PassengerTrip", req);
});

exports.sendDispatchToDriver = asyncHandler(async function (req) {
    console.log("sending dispatch to driver socket!");
    // console.log(BASE_URL + ":" + DRIVER_PORT);
    await socket.emit("DispatchTrip", req);
});

exports.removeDispatch = asyncHandler(async function (req) {
    console.log("sending dispatch remove to driver socket");
    // console.log(BASE_URL + ":" + DRIVER_PORT);
    await socket.emit("RemoveTrip", req);
});

exports.removeLiveTrip = asyncHandler(async function (req) {
    console.log("sending livetrip remove to driver socket");
    await socket.emit("RemoveTrip", req);
});

exports.sendLiveTripCancelToDriver = asyncHandler(async function (req) {
    console.log("sending livetrip cancel to driver socket");
    await socket.emit("PassengerCancelTrip", req);
});

exports.getTripPaymentToDriver = asyncHandler(function (req) {
    console.log("sending trip payment to driver socket!");
    socket.emit("getTripPaymentStatus", req);
});
