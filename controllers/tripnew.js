"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
// var mongoose = require("mongoose");
var cors = require("cors");
// var config = require("../config");
// var Dispatch = require("../models/dispatch");
// var DriverNotificationModel = require("../models/drivernotification");
// var jwt = require("jsonwebtoken");
// var bcrypt = require("bcryptjs");
// var cryptoHandler = "../controllers/cryptoHandler";
var geolib = require("geolib");
var VehicleTracking = require("../models/vehicletracking");
// var PassengerTrack = require("../models/passengertracking");
// var VehicleCategory = require("../models/vehiclecategory");
var Trip = require("../models/trip");
// var passengerSocket = require("../services/passengerNotifications");
// var Driver = require("../models/driver");
var User = require("../models/user");
// var Vehicle = require("../models/vehicle");
// var sendSms = require("../services/sendSms");
var DriverNotification = require("../services/driverNotifications");
// var PassengerNotification = require("../services/passengerNotifications");
// var PassengerPushNotification = require("../services/passengerPushNotifications");
var DriverPushNotification = require("../services/driverPushNotification");
// var PassengerWallet = require("../models/passengerwallet");
// var WalletUpdate = require("../services/walletUpdate");
// var money = require("walletjs");

require("dotenv").config();

//################### geocoder settings ###################################
var NodeGeocoder = require("node-geocoder");

var options = {
  provider: "google",

  httpAdapter: "https",
  apiKey: process.env.GOOGLE_MAP_API_KEY,
  formatter: null,
};

var geocoder = NodeGeocoder(options);

//##########################################################################

/* dubllicates unwanted */
// var DriverNotification = require('../services/driverNotifications');

/* unused */
//var Notification = require('../models/drivernotification');

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

exports.findDriverForPassenger = function (req, res) {
  console.log("##### trip : findDriverForPassenger #####");
  console.log(req.body);

  /* get passengerdata by id */
  User.findOne({
    _id: req.body.passengerId,
  }).exec(function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (data != null) {
        var trip = new Trip();

        trip.passengerDetails.id = req.body.passengerId;
        trip.passengerDetails.name = data.name;
        trip.passengerDetails.email = data.email;
        trip.passengerDetails.birthday = data.birthday;
        trip.passengerDetails.nic = data.nic;
        trip.passengerDetails.gender = data.gender;
        trip.passengerDetails.contactNumber = data.contactNumber;
        trip.passengerDetails.userProfilePic = data.userProfilePic;

        console.log(data.name);

        trip.pickupDateTime = new Date();

        trip.pickupLocation.address = req.body.pickupLocation.address;
        trip.pickupLocation.latitude = req.body.pickupLocation.latitude;
        trip.pickupLocation.longitude = req.body.pickupLocation.longitude;

        trip.dropLocations = req.body.dropLocations;
        trip.distance = req.body.distance;
        trip.bidValue = req.body.bidValue;
        trip.vehicleCategory = req.body.vehicleCategory;
        trip.vehicleSubCategory = req.body.vehicleSubCategory;
        trip.hireCost = req.body.hireCost;
        trip.totalPrice = 0;
        trip.notes = req.body.notes != undefined ? req.body.notes : "";
        trip.type = req.body.type;
        trip.validTime = req.body.validTime;
        trip.status = "default";

        /* payment method */
        trip.payMethod = req.body.payMethod;

        trip.save(function (err, result) {
          if (err) {
            console.log(
              "#################### error occured #######################"
            );
            console.log(err);
            res.status(500).send(err);
          } else {
            console.log(
              "#################### trip data saved in db successfully ####################"
            );
            console.log(result);

            if (result != null) {
              result.pickupLocation.address =
                result.pickupLocation.address.replace(
                  /[^a-zA-Z0-9,-\s!?]+/g,
                  ""
                );
              result.dropLocations[0].address =
                result.dropLocations[0].address.replace(
                  /[^a-zA-Z0-9,-\s!?]+/g,
                  ""
                );

              /* set message */
              var msg = "Pickup Location - " + result.pickupLocation.address;

              /* find online drivers from vehicle tracking */
              VehicleTracking.find({
                currentStatus: "online",
                vehicleSubCategory: req.body.vehicleSubCategory,
              }).exec(function (err, data) {
                if (err) {
                  console.log(
                    "####################### vehicle tracking data retrive error ##########################"
                  );
                  console.log("error : " + err);
                  res.status(500).send(err);
                } else {
                  if (data.length === 0) {
                    console.log(
                      "####################### No online Drivers ##########################"
                    );
                    res.status(203).json({
                      message: "No online Drivers",
                    });
                  } else {
                    var tempDrivers = [];
                    var notifiedDrivers = [];

                    data.forEach(function (element) {
                      if (
                        geolib.isPointInCircle(
                          {
                            latitude: element.currentLocation.latitude,
                            longitude: element.currentLocation.longitude,
                          },
                          {
                            latitude: req.body.pickupLocation.latitude,
                            longitude: req.body.pickupLocation.longitude,
                          },
                          parseInt(req.body.operationRadius * 1000)
                        )
                      ) {
                        element.distanceBetween = geolib.getDistance(
                          {
                            latitude: element.currentLocation.latitude,
                            longitude: element.currentLocation.longitude,
                          },
                          {
                            latitude: req.body.pickupLocation.latitude,
                            longitude: req.body.pickupLocation.longitude,
                          }
                        );
                        tempDrivers.push(element);
                      }
                    });

                    tempDrivers.sort(
                      (a, b) =>
                        parseFloat(a.distanceBetween) -
                        parseFloat(b.distanceBetween)
                    );

                    console.log(
                      "####################### notifiedDrivers #######################"
                    );
                    notifiedDrivers = tempDrivers.slice(0, 4);
                    console.log(notifiedDrivers);

                    notifiedDrivers.forEach((element) => {
                      var trip = {
                        socketId: element.socketId,
                        trip: result,
                      };
                      DriverNotification.sendDispatchToDriver(trip);

                      /* author : ghost - send push notifications*/
                      var driverId = element.driverId;
                      DriverPushNotification.sendDispatchPushNotificationToDriver(
                        driverId,
                        msg
                      );
                    });

                    if (notifiedDrivers.length > 0) {
                      //console.log('notified drivers');
                      //console.log(trip);
                      // console.log(notifiedDrivers);
                      Trip.update(
                        {
                          _id: trip._id,
                        },
                        {
                          $push: {
                            noifiedDrivers: {
                              $each: notifiedDrivers,
                            },
                          },
                        }
                      ).exec(function (err, updateres) {
                        console.log("trip update response");
                        if (err) {
                          console.log("trip update failed");
                          res.status(500).send(err);
                        } else {
                          console.log("trip updated successfully");
                          res.status(200).json({
                            message: "success",
                            details: "Your Request will Send to the drivers",
                            content: trip,
                            notifiedDrivers: notifiedDrivers,
                          });
                        }
                      });
                    } else {
                      res.status(202).json({
                        message: "No drivers in this area",
                      });
                    }
                  }
                }
              });
            }
          }
        });
      } else {
        res.status(400).json({
          message: "failed!",
          details: "User not found",
        });
      }
    }
  });
};
