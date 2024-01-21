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
var DriverWallet = require("../models/driverwallet");
var AgentWallet = require("../models/agentwallet");
var DriverPushNotification = require("../services/driverPushNotification");

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

exports.driverWallet = function (req, res) {
  console.log("###### Admin ######");
  res.json({
    status: "dispatcher",
  });
};

//create a wallet for driver
exports.createWallet = function (req, res) {
  console.log(req.body);
  if (req.body.driverId) {
    var wallet = new DriverWallet();
    wallet.driverId = req.body.driverId;

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

//recharge wallet amount of driver
exports.rechargeWallet = function (req, res) {
  var newVals = {
    $inc: {
      totalWalletPoints: req.body.rechargeAmount,
    },
  };
  DriverWallet.findOneAndUpdate(
    { driverId: req.body.driverId },
    newVals,
    function (err, wallet) {
      if (err) {
        res.status(500).send(err);
      } else {
        var totalWalletPoints =
          wallet.totalWalletPoints + req.body.rechargeAmount;

        var title = `Taxime Driver Wallet`;
        var msg =
          `Your wallet updated \n` +
          `Recharge amount: ` +
          req.body.rechargeAmount +
          `\nTotal Balance: ` +
          totalWalletPoints;
        DriverPushNotification.sendPushNotificationToDriver(
          req.body.driverId,
          title,
          msg
        );

        res.status(200).json({ message: wallet });
      }
    }
  );
};

//recharge wallet amount of driver by driver company
exports.rechargeWalletByDriverCompany = function (req, res) {
  console.log(
    "########## driver wallet : rechargeWalletByDriverCompany ##########"
  );

  var newVals = {
    $inc: {
      totalWalletPoints: req.body.rechargeAmount,
    },
  };

  AgentWallet.findOne(
    { companyCode: req.body.companyCode },
    function (err, wallet) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (wallet != null) {
          if (wallet.totalWalletPoints <= 0) {
            console.log(
              "company wallet balance low, please recharge company wallet"
            );
            res.status(400).json({
              message: "failed",
              details:
                "company wallet balance low, please recharge company wallet",
            });
          } else {
            console.log(wallet.totalWalletPoints);
            if (wallet.totalWalletPoints >= req.body.rechargeAmount) {
              /* update driver wallet */
              DriverWallet.findOneAndUpdate(
                { driverId: req.body.driverId },
                newVals,
                function (err, driverWallet) {
                  if (err) {
                    res.status(500).send(err);
                  } else {
                    var newDecVals = {
                      $inc: {
                        totalWalletPoints: -req.body.rechargeAmount,
                      },
                    };

                    AgentWallet.findOneAndUpdate(
                      { companyCode: req.body.companyCode },
                      newDecVals,
                      function (err, agentWallet) {
                        if (err) {
                          res.status(500).send(err);
                        } else {
                          console.log("agent wallet updated");
                          res.status(200).json({
                            message: driverWallet,
                          });
                        }
                      }
                    );

                    console.log("driver wallet updated");
                  }
                }
              );
            } else {
              console.log("company wallet balance not enough");
              res.status(400).json({
                message: "failed",
                details: "company wallet balance not enough",
              });
            }
          }
        } else {
          res.status(500).json({
            message: "failed",
            details: "company wallet not found",
          });
        }
      }
    }
  );
};

//update wallet amount of driver
exports.updateWallet = function (req, res) {
  var newVals = {
    $set: {
      totalWalletPoints: req.body.rechargeAmount,
    },
  };
  DriverWallet.findOneAndUpdate(
    { driverId: req.body.driverId },
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

//get wallet details of driver
exports.getWallet = function (req, res) {
  DriverWallet.find({ driverId: req.body.driverId }, function (err, wallet) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({
        message: "success",
        details: "get category data Successfully",
        content: wallet,
      });
    }
  });
};
