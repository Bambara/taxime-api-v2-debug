"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
// const config = require("../config");
// var Driver = require("../models/driver");

const BASE_URL = process.env.BASE_URL;
const ADMIN_PORT = process.env.ADMIN_PORT;

const socket = require("socket.io-client")(BASE_URL + ":" + ADMIN_PORT);

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

exports.driverRegToAdmin = function (req) {
  console.log("notify");
  socket.emit("newDriver", req);
};

// exports.driverStatus = function (req) {
//     console.log('driver state')
//     socket.emit('driverConnect', req);
// };
