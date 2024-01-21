"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var Admin = require("../models/admin");
var Driver = require("../models/driver");
var Dispatcher = require("../models/dispatcher");
const Vehicle = require("../models/vehicle");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var imageUpload = require("./imageUpload");
var otp = require("../services/randomnum");
var adminRegEmail = require("../emailTemplate/adminRegister");
var User = require("../models/user");
var VehicleTracking = require("../models/vehicletracking");
var VehicleCategory = require("../models/vehiclecategory");
var DispatcherWallet = require("../models/dispatcherwallet");

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

exports.dispatcherWallet = function (req, res) {
  console.log("###### Admin ######");
  res.json({
    status: "dispatcher",
  });
};

//create a wallet for dispatcher
exports.createWallet = function (req, res) {
  console.log(req.body);
  if (req.body.dispatcherId) {
    var wallet = new DispatcherWallet();
    wallet.dispatcherId = req.body.dispatcherId;

    wallet.save(function (err, wallet) {
      if (err) {
        return res.status(500).send(err);
      } else {
        return res.status(200).json({ message: "success!" });
      }
    });
  } else {
    return res.status(500).json({ message: "Server Error!" });
  }
};

//recharge wallet amount of dispatcher
exports.rechargeWallet = function (req, res) {
  var newVals = {
    $inc: {
      totalWalletPoints: req.body.rechargeAmount,
    },
  };
  DispatcherWallet.findOneAndUpdate(
    { dispatcherId: req.body.dispatcherId },
    newVals,
    function (err, wallet) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json({ message: wallet });
      }
    }
  );
};

//update wallet amount of dispatcher
exports.updateWallet = function (req, res) {
  var newVals = {
    $set: {
      totalWalletPoints: req.body.rechargeAmount,
    },
  };
  DispatcherWallet.findOneAndUpdate(
    { dispatcherId: req.body.dispatcherId },
    newVals,
    function (err, wallet) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json({ message: wallet });
      }
    }
  );
};

//get wallet amount of dispatcher
exports.getWallet = function (req, res) {
  DispatcherWallet.find(
    { dispatcherId: req.body.dispatcherId },
    function (err, wallet) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json({
          message: "success",
          details: "get category data Successfully",
          content: wallet,
        });
      }
    }
  );
};
