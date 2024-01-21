"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
// const config = require("../config");
// const Dispatch = require("../models/dispatch");
// const DriverNotificationModel = require("../models/drivernotification");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const cryptoHandler = "../controllers/cryptoHandler";
const geolib = require("geolib");
const VehicleTracking = require("../models/vehicletracking");
const PassengerTrack = require("../models/passengertracking");
const VehicleCategory = require("../models/vehiclecategory");
const Trip = require("../models/trip");
const passengerSocket = require("../services/passengerNotifications");
const Driver = require("../models/driver");
const Vehicle = require("../models/vehicle");
// const sendSms = require("../services/sendSms");
const DriverNotification = require("../services/driverNotifications");
// const PassengerNotification = require("../services/passengerNotifications");
const PassengerPushNotification = require("../services/passengerPushNotifications");
const DriverPushNotification = require("../services/driverPushNotification");
const PassengerWallet = require("../models/passengerwallet");
const WalletUpdate = require("../services/walletUpdate");
const money = require("walletjs");

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

exports.cancelTrip = function (req, res) {
  var cost1 = Math.round(req.body.cancelCost);
  var cost = money.Money.init(req.body.cancelCost);
  var estimatedCost = money.Money.init(req.body.estimatedCost);

  if (req.body.type == "passengerTrip") {
    Trip.update(
      {
        _id: req.body.tripId,
      },
      {
        $set: {
          status: "canceled",
        },
        $push: {
          cancelDetails: {
            cancelReason: req.body.cancelReason,
            canceledDriverId: req.body.driverId,
          },
        },
      },
      function (error, trip) {
        if (error) {
          console.log("block1");
          res.status(500).json({
            message: "server error",
          });
        } else {
          var tripToDriver = {
            tripId: req.body.tripId,
            tripEarning: -1 * cost.getValue(),
            tripAdminCommission: cost.getValue(),
            totalTripValue: estimatedCost.getValue(),
            pickupLocation: req.body.pickupLocation,
            destinations: req.body.dropLocations,
          };

          var tripToAdmin = {
            tripId: req.body.tripId,
            tripEarning: cost.getValue(),
            tripAdminCommission: cost.getValue(),
            totalTripValue: estimatedCost.getValue(),
            pickupLocation: req.body.pickupLocation,
            destinations: req.body.dropLocations,
          };

          var driverTransactionObj = {
            dateTime: new Date(),
            transactionAmount: cost.getValue(),
            transactionType: "other",
            isATrip: false,
            isCredited: false,
            method: "cash",
            discription: "Trip cancel by driver",
            trip: tripToDriver,
          };

          var companyTransactionObj = {
            dateTime: new Date(),
            transactionAmount: cost.getValue(),
            transactionType: "other",
            isATrip: false,
            isCredited: true,
            method: "cash",
            discription: "Trip cancel by driver",
            trip: tripToAdmin,
          };

          /* update wallets */
          WalletUpdate.DriverWalletUpdateForTripCancel(
            req.body.driverId,
            driverTransactionObj,
            cost.getValue()
          );
          WalletUpdate.CompanyWalletUpdateForTripCancel(
            companyTransactionObj,
            cost.getValue()
          );

          PassengerTrack.findOne({
            passengerId: req.body.passengerId,
          }).exec(function (error1, passenger) {
            if (error1) {
              console.log("error in passenger tracking");
            } else {
              console.log(passenger);
              var passengerSocketObj = {
                socketId: passenger.socketId,
                canceledDriverId: req.body.driverId,
                cancelReason: req.body.cancelReason,
              };

              var msg = `The driver canceled your booking.  Reason : ${req.body.cancelReason}`;

              /* notify to passenger */
              passengerSocket.sendTripCancelToPassenger(passengerSocketObj);
              /* author : ghost / push notification */
              PassengerPushNotification.sendTripCancelPushNotificationToPassenger(
                req.body.passengerId,
                msg
              );
            }
          });

          res.status(200).json({
            message: "success!",
          });
        }
      }
    );
  } else {
    res.status(500).json({
      message: "server error",
    });
  }
};

// exports.findDriverForPassenger = function (req, res) {
//     console.log('##### trip : findDriverForPassenger #####')
//     // console.log(req.body)
//     var trip = new Trip();

//     trip.passengerDetails.id             = req.body.passengerDetails.id;
//     trip.passengerDetails.name           = req.body.passengerDetails.name;
//     trip.passengerDetails.email          = req.body.passengerDetails.email;
//     trip.passengerDetails.birthday       = req.body.passengerDetails.birthday;
//     trip.passengerDetails.nic            = req.body.passengerDetails.nic;
//     trip.passengerDetails.gender         = req.body.passengerDetails.gender;
//     trip.passengerDetails.contactNumber  = req.body.passengerDetails.contactNumber;
//     trip.passengerDetails.userProfilePic = req.body.passengerDetails.userProfilePic;
//     // trip.noOfPassengers = req.body.noOfPassengers;

//     trip.pickupDateTime = new Date();

//     trip.pickupLocation.address   = req.body.pickupLocation.address;
//     trip.pickupLocation.latitude  = req.body.pickupLocation.latitude;
//     trip.pickupLocation.longitude = req.body.pickupLocation.longitude;

//     trip.dropLocations      = req.body.dropLocations;
//     trip.distance           = req.body.distance;
//     trip.bidValue           = req.body.bidValue;
//     trip.vehicleCategory    = req.body.vehicleCategory;
//     trip.vehicleSubCategory = req.body.vehicleSubCategory;
//     trip.hireCost           = req.body.hireCost;
//     trip.totalPrice         = 0;
//     trip.notes              = req.body.notes != undefined ? req.body.notes : '';
//     trip.type               = req.body.type;
//     trip.validTime          = req.body.validTime;
//     trip.status             = 'default';

//     /* payment method */
//     trip.payMethod = req.body.payMethod;

//     trip.save(function (err, result) {
//         if (err) {
//             console.log('#################### error occured #######################');
//             console.log(err);
//             res.status(500).send(err);
//         } else {

//             console.log('#################### trip data saved in db successfully ####################');
//             console.log(result);

//             if (result != null) {

//                 result.pickupLocation.address = result.pickupLocation.address.replace(/[^a-zA-Z0-9,-\s!?]+/g, '');
//                 result.dropLocations[0].address = result.dropLocations[0].address.replace(/[^a-zA-Z0-9,-\s!?]+/g, '');

//                 /* set message */
//                 var msg = "Pickup Location - "+ result.pickupLocation.address;

//                 /* find online drivers from vehicle tracking */
//                 VehicleTracking.find({
//                     currentStatus: 'online',
//                     vehicleSubCategory: req.body.vehicleSubCategory
//                 })
//                 .exec(function (err, data) {

//                     if (err) {
//                         console.log('####################### vehicle tracking data retrive error ##########################');
//                         console.log("error : "+err);
//                         res.status(500).send(err);
//                     } else {
//                     if (data.length === 0) {
//                         console.log("####################### No online Drivers ##########################");
//                         res.status(203).json({
//                             message: 'No online Drivers'
//                         });
//                     } else {

//                         var tempDrivers = [];
//                         var notifiedDrivers = [];

//                         data.forEach(function (element) {

//                             if (
//                                 geolib.isPointInCircle({
//                                     latitude: element.currentLocation.latitude,
//                                     longitude: element.currentLocation.longitude
//                                 }, {
//                                     latitude: req.body.pickupLocation.latitude,
//                                     longitude: req.body.pickupLocation.longitude
//                                 },
//                                 parseInt(req.body.operationRadius * 1000)
//                                 )
//                             ) {
//                                 element.distanceBetween = geolib.getDistance({
//                                 latitude: element.currentLocation.latitude,
//                                 longitude: element.currentLocation.longitude
//                                 }, {
//                                 latitude: req.body.pickupLocation.latitude,
//                                 longitude: req.body.pickupLocation.longitude
//                                 })
//                                 tempDrivers.push(element);
//                             }
//                         });

//                         tempDrivers.sort((a, b) => parseFloat(a.distanceBetween) - parseFloat(b.distanceBetween));

//                         console.log('####################### notifiedDrivers #######################');
//                         notifiedDrivers = tempDrivers.slice(0, 4);
//                         console.log(notifiedDrivers);

//                         notifiedDrivers.forEach(element => {

//                             var trip = {
//                                 'socketId': element.socketId,
//                                 'trip': result
//                             }
//                             DriverNotification.sendDispatchToDriver(trip);

//                             /* author : ghost - send push notifications*/
//                             var driverId = element.driverId;
//                             DriverPushNotification.sendDispatchPushNotificationToDriver(driverId, msg);

//                         });

//                         if (notifiedDrivers.length > 0) {
//                             //console.log('notified drivers');
//                             //console.log(trip);
//                             // console.log(notifiedDrivers);
//                             Trip.update({
//                                 _id: trip._id
//                             }, {
//                                 $push: {
//                                     noifiedDrivers: {
//                                         $each: notifiedDrivers
//                                     }
//                                 }
//                             }).exec(function (err, updateres) {
//                                 console.log("trip update response");
//                                 if (err) {
//                                     console.log("trip update failed");
//                                     res.status(500).send(err)
//                                 } else {
//                                     console.log("trip updated successfully");
//                                     res.json({
//                                         message: 'success',
//                                         details: "Your Request will Send to the drivers",
//                                         content: trip,
//                                         notifiedDrivers: notifiedDrivers
//                                     });
//                                 }
//                             })

//                         } else {
//                             res.status(202).json({
//                                 message: 'No drivers in this area'
//                             });
//                         }

//                     }
//                     }
//                 });
//             }
//         }
//     });

// }

// exports.findDriverForPassenger = function (req, res) {
//     console.log('##### trip : findDriverForPassenger #####');
//     console.log(req.body)
//     var trip = new Trip();

//     trip.passengerDetails.id             = req.body.passengerDetails.id;
//     trip.passengerDetails.name           = req.body.passengerDetails.name;
//     trip.passengerDetails.email          = req.body.passengerDetails.email;
//     trip.passengerDetails.birthday       = req.body.passengerDetails.birthday;
//     trip.passengerDetails.nic            = req.body.passengerDetails.nic;
//     trip.passengerDetails.gender         = req.body.passengerDetails.gender;
//     trip.passengerDetails.contactNumber  = req.body.passengerDetails.contactNumber;
//     trip.passengerDetails.userProfilePic = req.body.passengerDetails.userProfilePic;
//     // trip.noOfPassengers = req.body.noOfPassengers;

//     trip.pickupDateTime = new Date();

//     trip.pickupLocation.address   = req.body.pickupLocation.address;
//     trip.pickupLocation.latitude  = req.body.pickupLocation.latitude;
//     trip.pickupLocation.longitude = req.body.pickupLocation.longitude;

//     trip.dropLocations      = req.body.dropLocations;
//     trip.distance           = req.body.distance;
//     trip.bidValue           = req.body.bidValue;
//     trip.vehicleCategory    = req.body.vehicleCategory;
//     trip.vehicleSubCategory = req.body.vehicleSubCategory;
//     trip.hireCost           = req.body.hireCost;
//     trip.totalPrice         = 0;
//     trip.notes              = req.body.notes != undefined ? req.body.notes : '';
//     trip.type               = req.body.type;
//     trip.validTime          = req.body.validTime;
//     trip.status             = 'default';
//     /* payment method */
//     trip.payMethod = req.body.payMethod;

//     var pickupLocationAddress = req.body.pickupLocation.address.replace(/[^a-zA-Z0-9,-\s!?]+/g, '');
//     var dropLocationsAddress = req.body.dropLocations[0].address.replace(/[^a-zA-Z0-9,-\s!?]+/g, '');

//     /* set message */
//     var msg = "Pickup Location - "+ pickupLocationAddress + '\n Drop Location - '+dropLocationsAddress;

//     // result.pickupLocation.address = result.pickupLocation.address.replace(/[^a-zA-Z0-9,-\s!?]+/g, '');
//     // result.dropLocations[0].address = result.dropLocations[0].address.replace(/[^a-zA-Z0-9,-\s!?]+/g, '');

//     // /* set message */
//     // var msg = "Pickup Location - "+ result.pickupLocation.address;
//     console.log('##### test #####')
//     /* find online drivers from vehicle tracking */
//     VehicleTracking.find({
//         currentStatus: 'online',
//         vehicleSubCategory: req.body.vehicleSubCategory
//     })
//     .exec(function (err, data) {

//         if (err) {
//             console.log('####################### vehicle tracking data retrive error ##########################');
//             console.log("error : "+err);
//             res.status(500).send(err);
//         } else {
//             if (data.length === 0) {
//                 console.log("####################### No online Drivers ##########################");
//                 res.status(203).json({
//                     message: 'No online Drivers'
//                 });
//             } else {

//                 var tempDrivers = [];
//                 var notifiedDrivers = [];

//                 data.forEach(function (element) {
//                     if (
//                         geolib.isPointInCircle({
//                             latitude: element.currentLocation.latitude,
//                             longitude: element.currentLocation.longitude
//                         }, {
//                             latitude: req.body.pickupLocation.latitude,
//                             longitude: req.body.pickupLocation.longitude
//                         },
//                         parseInt(req.body.operationRadius * 1000)
//                         )
//                     ) {
//                         element.distanceBetween = geolib.getDistance({
//                             latitude: element.currentLocation.latitude,
//                             longitude: element.currentLocation.longitude
//                         }, {
//                             latitude: req.body.pickupLocation.latitude,
//                             longitude: req.body.pickupLocation.longitude
//                         })
//                         tempDrivers.push(element);
//                     }
//                 });

//                 tempDrivers.sort((a, b) => parseFloat(a.distanceBetween) - parseFloat(b.distanceBetween));

//                 console.log('####################### notifiedDrivers #######################');
//                 notifiedDrivers = tempDrivers.slice(0, 4);
//                 console.log(notifiedDrivers);

//                 /* set notified drivers to trib object */
//                 trip.noifiedDrivers = notifiedDrivers;

//                 if (notifiedDrivers.length > 0) {
//                     /* SAVE TRIP DATA */
//                     trip.save(function (err, result) {
//                         if (err) {
//                             console.log('#################### error occured #######################');
//                             console.log(err);
//                             res.status(500).send(err);
//                         } else {

//                             console.log('#################### trip data saved in db successfully ####################');
//                             //console.log(result);

//                             if (result != null) {

//                                 /* SEND DISPATCH NOTIFICATIONS TO ONLINE DRIVERS */
//                                 notifiedDrivers.forEach(element => {

//                                     var trip = {
//                                         'socketId': element.socketId,
//                                         'trip': result
//                                     }
//                                     DriverNotification.sendDispatchToDriver(trip);

//                                     /* author : ghost - send push notifications*/
//                                     var driverId = element.driverId;
//                                     DriverPushNotification.sendDispatchPushNotificationToDriver(driverId, msg);

//                                 });

//                                 console.log("New trip added successfully");
//                                 res.json({
//                                     message: 'success',
//                                     details: "Your Request will Send to the drivers",
//                                     content: trip,
//                                     notifiedDrivers: notifiedDrivers
//                                 });

//                             } else {
//                                 console.log("new trip added failed");
//                                 res.status(500).send(err)
//                             }
//                         }
//                     });

//                 } else {
//                     res.status(202).json({
//                         message: 'No online drivers found from this area'
//                     });
//                 }

//             }
//         }
//     });

// }

exports.findDriverForPassenger = function (req, res) {
  console.log("##### trip : findDriverForPassenger #####");
  // console.log(req.body)
  var trip = new Trip();

  trip.passengerDetails.id = req.body.passengerDetails.id;
  trip.passengerDetails.name = req.body.passengerDetails.name;
  trip.passengerDetails.email = req.body.passengerDetails.email;
  trip.passengerDetails.birthday = req.body.passengerDetails.birthday;
  trip.passengerDetails.nic = req.body.passengerDetails.nic;
  trip.passengerDetails.gender = req.body.passengerDetails.gender;
  trip.passengerDetails.contactNumber = req.body.passengerDetails.contactNumber;
  trip.passengerDetails.userProfilePic =
    req.body.passengerDetails.userProfilePic;
  // trip.noOfPassengers = req.body.noOfPassengers;

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
      console.log("#################### error occured #######################");
      console.log(err);
      res.status(500).send(err);
    } else {
      console.log(
        "#################### trip data saved in db successfully ####################"
      );
      console.log(result);

      if (result != null) {
        result.pickupLocation.address = result.pickupLocation.address.replace(
          /[^a-zA-Z0-9,-\s!?]+/g,
          ""
        );
        result.dropLocations[0].address =
          result.dropLocations[0].address.replace(/[^a-zA-Z0-9,-\s!?]+/g, "");

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
                  parseFloat(a.distanceBetween) - parseFloat(b.distanceBetween)
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
};

exports.driverAcceptLiveTrip = function (req, res) {
  console.log(req.body);
  if (req.body.type === "passengerTrip") {
    var newVals1 = {
      $set: {
        assignedDriverId: req.body.driverId,
        assignedVehicleId: req.body.vehicleId,
      },
    };

    var newVals = {
      $set: {
        assignedDriverId: req.body.driverId,
        assignedVehicleId: req.body.vehicleId,
        status: "accepted",
      },
    };

    Trip.findOne({
      $and: [
        {
          _id: req.body.id,
        },
        {
          assignedDriverId: null,
        },
        {
          assignedVehicleId: null,
        },
      ],
    }).exec(function (err, data) {
      if (err) {
        res.status(500).send(err);
      } else {
        console.log(data);
        if (data == null) {
          res.status(208).json({
            message: "Trip Already Accepted!",
          });
        } else {
          // Trip.findByIdAndUpdate(req.body.id, newVals1, function (err, result) {

          console.log(req.body.vehicleSubCategory);
          console.log(req.body.vehicleCategory);
          if (req.body.vehicleSubCategory) {
            VehicleCategory.find({
              isEnable: true,
              categoryName: req.body.vehicleCategory,
            }).exec(function (err, category) {
              if (err) {
                console.log("####### error occured" + err);
                res.status(500).send(err);
              } else {
                if (category == null || category.length == 0) {
                  res.status(204).json({
                    message: "failed",
                    details: "No data found",
                    status: "failed",
                  });
                } else {
                  var timeNow = new Date();
                  console.log("###### time #### ", timeNow);

                  var minsNow =
                    parseInt(timeNow.getHours()) * 60 +
                    parseInt(timeNow.getMinutes()) +
                    330;
                  console.log(
                    "###### time #### ",
                    timeNow.getHours(),
                    " : ",
                    timeNow.getMinutes() + " => " + minsNow
                  );

                  geocoder.reverse(
                    {
                      lat: req.body.pickupLocation.latitude,
                      lon: req.body.pickupLocation.longitude,
                    },
                    function (err1, resp) {
                      // geocoder.geocode(req.body.pickupLocation.address, function (err1, resp) {
                      console.log("****** district ****** ", resp);
                      if (err1) {
                        console.log("error in geocode");
                        //res.status(500).send(err1);
                      }
                      //var district = resp[0].administrativeLevels.level2long;
                      var district = "Colombo";

                      if (!district) {
                        district = "Colombo";
                      }

                      var responseData = [];
                      console.log("#### category[0] ####");
                      // console.log(category[0])
                      var subCatData = category[0].subCategory.find(
                        (el) =>
                          el.subCategoryName == req.body.vehicleSubCategory
                      );
                      if (subCatData == null) {
                        console.log("subcategory not available");
                        res.status(202).json({
                          message: "Subcategory not available",
                        });
                      } else {
                        console.log("#### subcat data####");
                        // console.log(subCatData);

                        var temp = null;
                        temp = subCatData.priceSelection.find(
                          (el) => el.districtName == district
                        );
                        var defaultTimeBase = temp.timeBase[0];
                        if (temp != null || temp.length == 0) {
                          var timeBaseSelected = {};
                          temp.timeBase.forEach((ele) => {
                            var start =
                              parseInt(ele.startingTime.split(":")[0]) * 60 +
                              parseInt(ele.startingTime.split(":")[1]);
                            var end =
                              parseInt(ele.endingTime.split(":")[0]) * 60 +
                              parseInt(ele.endingTime.split(":")[1]);

                            if (start < end) {
                              if (minsNow >= start && minsNow <= end) {
                                timeBaseSelected = ele;
                              } else {
                                timeBaseSelected = defaultTimeBase;
                              }
                            } else {
                              if (minsNow >= start && minsNow <= end) {
                                timeBaseSelected = ele;
                              } else {
                                timeBaseSelected = defaultTimeBase;
                              }
                            }
                          });
                          console.log("###selected timebase");
                          console.log(timeBaseSelected);

                          responseData.push(timeBaseSelected);

                          Trip.findByIdAndUpdate(
                            req.body.id,
                            newVals,
                            function (err, result) {
                              if (err) {
                                console.log("1");
                                res.status(500).send(err);
                              } else {
                                console.log("2");
                                if (result == null) {
                                  console.log("2.1");
                                  res.status(204).send();
                                } else {
                                  if (result.noifiedDrivers.length > 0) {
                                    console.log("2.2");
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
                                    result.noifiedDrivers.forEach((element) => {
                                      //console.log(element)
                                      // if (element.driverId != req.body.driverId && element.vehicleId != req.body.vehicleId) {
                                      var trip = {
                                        socketId: element.socketId,
                                        trip: result,
                                      };
                                      DriverNotification.removeDispatch(trip);
                                      // }
                                    });

                                    if (req.body.customerTelephoneNo) {
                                      Driver.findById(
                                        mongoose.Types.ObjectId(
                                          req.body.driverId
                                        ),
                                        function (err, driverData) {
                                          if (err) {
                                            console.log(
                                              "################### error finding driver ####################"
                                            );
                                            res.status(500).json({
                                              message: "server error!",
                                            });
                                          } else {
                                            Vehicle.findById(
                                              mongoose.Types.ObjectId(
                                                req.body.vehicleId
                                              ),
                                              function (err, vehicleData) {
                                                if (err) {
                                                  console.log(
                                                    "################### error finding vehicle ####################"
                                                  );
                                                  res.status(500).json({
                                                    message: "server error!",
                                                  });
                                                } else {
                                                  var msg = `Your booking is confirmed. Driver will arrive shortly. Driver : ${driverData.firstName} ${driverData.lastName}, ContactNo : ${driverData.mobile}, VehicleNo : ${vehicleData.vehicleRegistrationNo}`;
                                                  console.log(msg);
                                                  if (
                                                    vehicleData.vehicleModel
                                                  ) {
                                                    msg =
                                                      msg +
                                                      `,  Model : ${vehicleData.vehicleModel}`;
                                                  }
                                                  if (
                                                    vehicleData.vehicleColor
                                                  ) {
                                                    msg =
                                                      msg +
                                                      `, Color : ${vehicleData.vehicleColor}`;
                                                  }

                                                  PassengerTrack.findOne({
                                                    passengerId:
                                                      req.body.passengerId,
                                                  }).exec(function (
                                                    error1,
                                                    passenger
                                                  ) {
                                                    if (error1) {
                                                      console.log(
                                                        "#######error finding passenger#####"
                                                      );
                                                      res.status(500).json({
                                                        message:
                                                          "server error!",
                                                      });
                                                    } else {
                                                      console.log(
                                                        "#################passenger##############"
                                                      );
                                                      console.log(passenger);
                                                      if (passenger.socketId) {
                                                        var tripDetailsObj = {
                                                          tripId: result._id,
                                                          driverId:
                                                            driverData._id,
                                                          driverName:
                                                            driverData.firstName +
                                                            " " +
                                                            driverData.lastName,
                                                          driverContactNo:
                                                            driverData.mobile,
                                                          driverPic:
                                                            driverData.driverPic,
                                                          vehicleId:
                                                            vehicleData._id,
                                                          vehicleRegistrationNo:
                                                            vehicleData.vehicleRegistrationNo,
                                                          vehicleBrand:
                                                            vehicleData.vehicleBrandName,
                                                          vehicleModel:
                                                            vehicleData.vehicleModel,
                                                          vehicleColor:
                                                            vehicleData.vehicleColor,
                                                          longitude:
                                                            req.body
                                                              .currentLocationLongitude,
                                                          latitude:
                                                            req.body
                                                              .currentLocationLatitude,
                                                          socketId:
                                                            passenger.socketId,
                                                        };

                                                        passengerSocket.sendDriverDetailsToPassenger(
                                                          tripDetailsObj
                                                        );

                                                        /* author : ghost / push notification */
                                                        PassengerPushNotification.sendDriverAcceptedPushNotificationToPassenger(
                                                          req.body.passengerId,
                                                          msg
                                                        );

                                                        /* ghost commented */
                                                        //sendSms.sendMsg(req.body.customerTelephoneNo, msg);

                                                        res.json({
                                                          message: "success",
                                                          details:
                                                            "start trip Successfully",
                                                          content: responseData,
                                                          // content2: dispatcher
                                                        });
                                                      } else {
                                                        console.log(
                                                          "########no socket id#######"
                                                        );
                                                        res.status(500).json({
                                                          message:
                                                            "no socket id",
                                                        });
                                                      }
                                                    }
                                                  });
                                                }
                                              }
                                            );
                                          }
                                        }
                                      );
                                    } else {
                                      console.log(
                                        "######### no customer phone no"
                                      );
                                      res.status(500).json({
                                        message: "server error!",
                                      });
                                    }
                                  } else {
                                    res.status(500).json({
                                      message: "no notified drivers",
                                    });
                                  }
                                }
                              }
                            }
                          );
                        } else {
                          console.log("This district has no this service");
                          res.status(206).json({
                            message: "District is not available",
                          });
                        }
                      }
                    }
                  );
                }
              }
            });
          } else {
            res.status(500).json({
              message: "server error",
            });
          }

          //  })
        }
      }
    });
  } else {
    res.status(500).json({
      message: "server error!",
    });
  }
};

exports.endLiveTrip1 = function (req, res) {
  console.log("hit");
  var cost = money.Money.init(req.body.totalCost);
  var adminCommission = money.Money.init(req.body.adminCommission);
  var estimatedCost = money.Money.init(req.body.estimatedCost);
  var waitingCost = money.Money.init(req.body.waitingCost);

  var newVals = {
    $set: {
      status: "done",
      distance: req.body.distance,
      hireCost: estimatedCost.getValue(),
      totalPrice: cost.getValue(),
      waitTime: req.body.waitTime,
      waitingCost: waitingCost.getValue(),
      dropDateTime: new Date(),
      tripTime: parseFloat(req.body.tripTime),
      realPickupLocation: req.body.realPickupLocation,
      realDropLocation: req.body.realDropLocation,
    },
  };

  if (req.body.type === "passengerTrip") {
    console.log("passengerTrip");
    console.log(req.body);
    var adminCpecentage = adminCommission.divideBy(100);
    var adminCost = cost.multiplyBy(adminCpecentage);
    var acost = money.Money.init(adminCost);
    var driverCost = cost.subtract(acost);

    console.log(adminCost.getValue());
    console.log(driverCost.getValue());

    var tripToDriver = {
      tripId: req.body.tripId,
      tripEarning: driverCost.getValue(),
      tripAdminCommission: adminCost.getValue(),
      totalTripValue: cost.getValue(),
      pickupLocation: req.body.realPickupLocation,
      destinations: req.body.destinations,
    };

    var tripToAdmin = {
      tripId: req.body.tripId,
      tripEarning: adminCost.getValue(),
      tripAdminCommission: adminCost.getValue(),
      totalTripValue: cost.getValue(),
      pickupLocation: req.body.realPickupLocation,
      destinations: req.body.destinations,
    };

    var tripToPassenger = {
      tripId: req.body.tripId,
      tripCost: cost.getValue(),
      totalTripValue: cost.getValue(),
      pickupLocation: req.body.realPickupLocation,
      destinations: req.body.destinations,
    };

    var driverTransactionObj = {
      dateTime: new Date(),
      transactionAmount: driverCost.getValue(),
      transactionType: "trip",
      isATrip: true,
      isCredited: true,
      method: "cash",
      trip: tripToDriver,
    };

    var companyTransactionObj = {
      dateTime: new Date(),
      transactionAmount: adminCost.getValue(),
      transactionType: "trip",
      isATrip: true,
      isCredited: false,
      method: "cash",
      trip: tripToAdmin,
    };

    var passengerTransactionObj = {
      dateTime: new Date(),
      transactionAmount: cost.getValue(),
      transactionType: "trip",
      isATrip: true,
      isCredited: false,
      method: "cash",
      trip: tripToPassenger,
    };

    console.log(tripToPassenger);

    WalletUpdate.DriverWalletUpdateAfterTripEnd(
      req.body.driverId,
      driverTransactionObj,
      adminCost.getValue(),
      driverCost.getValue()
    );
    WalletUpdate.CompanyWalletUpdateAfterTripEnd(
      companyTransactionObj,
      adminCost.getValue()
    );
    WalletUpdate.PassengerWalletUpdateAfterTripEnd(
      req.body.passengerId,
      passengerTransactionObj,
      cost.getValue()
    );

    Trip.findByIdAndUpdate(req.body.tripId, newVals, function (err, result) {
      if (err) {
        console.log("error3");
        res.status(500).send(err);
      } else {
        if (result == null) {
          console.log("block2");
          res.status(204).json();
        } else {
          PassengerTrack.findOne({
            passengerId: req.body.passengerId,
          }).exec(function (error1, passenger) {
            if (error1) {
              console.log("error in passenger tracking");
            } else {
              var passengerSocketObj = {
                distance: req.body.distance,
                totalPrice: cost.getValue(),
                waitTime: req.body.waitTime,
                waitingCost: req.body.waitingCost,
                discount: 0,
                dropDateTime: new Date(),
                tripTime: parseFloat(req.body.tripTime),
                socketId: passenger.socketId,
              };
              passengerSocket.sendTripEndDetailsToPassenger(passengerSocketObj);

              var msg = `You have arrived to destination. Trip time : ${req.body.tripTime}`;
              /* author : ghost / push notification */
              PassengerPushNotification.sendTripEndPushNotificationToPassenger(
                req.body.passengerId,
                msg
              );
            }
          });

          console.log("success");
          res.status(200).json({
            message: "successfully end trip",
          });
        }
      }
    });
  } else {
    console.log("error3.1");
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

exports.endLiveTrip = function (req, res) {
  console.log("######## trip : endLiveTrip ########");
  // var passenger_wallet = {};
  var referral_commission = null;
  var cost = money.Money.init(req.body.totalCost);
  var adminCommission = money.Money.init(req.body.adminCommission);
  var estimatedCost = money.Money.init(req.body.estimatedCost);
  var waitingCost = money.Money.init(req.body.waitingCost);
  var referralType;
  var referredId;

  PassengerWallet.findOne({
    passengerId: req.body.passengerId,
  }).exec(function (error1, passengerwallet) {
    console.log("passengerwallet :" + passengerwallet);
    if (passengerwallet.referral[0]) {
      if (passengerwallet.referral[0].expireDate > new Date()) {
        console.log("expire date valid");
        referral_commission = money.Money.init(
          passengerwallet.referral[0].earning
        );
        adminCommission = adminCommission.subtract(referral_commission);
        referredId = passengerwallet.referral[0].referredId;

        if (passengerwallet.referral[0].referredType == "driverDispatcher") {
          referralType = "Driver";
        } else if (
          passengerwallet.referral[0].referredType == "userDispatcher"
        ) {
          referralType = "User";
        } else if (passengerwallet.referral[0].referredType == "driver") {
          referralType = "driver";
        }
      }
    }

    console.log("referralType :" + referralType);

    /* check trip type */
    if (req.body.type === "passengerTrip") {
      console.log("passengerTrip :" + req.body);

      var adminCpecentage = adminCommission.divideBy(100);
      var adminCost = cost.multiplyBy(adminCpecentage);
      var acost = money.Money.init(adminCost);
      var driverCost = cost.subtract(acost);

      if (referral_commission != null) {
        var referralCpecentage = referral_commission.divideBy(100);
        var referralCost = cost.multiplyBy(referralCpecentage);

        if (referralType === "driver") {
          var tripToReferralDriver = {
            tripId: req.body.tripId,
            tripEarning: referralCost.getValue(),
            tripAdminCommission: 0,
            totalTripValue: cost.getValue(),
            pickupLocation: req.body.realPickupLocation,
            destinations: req.body.destinations,
          };

          var referralDriverTransactionObj = {
            dateTime: new Date(),
            transactionAmount: referralCost.getValue(),
            transactionType: "other",
            discription: "refferal earning",
            isATrip: false,
            isCredited: true,
            method: "cash",
            trip: tripToReferralDriver,
          };
        } else if (referralType === "Driver" || referralType === "User") {
          var tripToDispatcher = {
            tripId: req.body.tripId,
            tripEarning: referralCost.getValue(),
            tripAdminCommission: 0,
            totalTripValue: cost.getValue(),
            pickupLocation: req.body.realPickupLocation,
            destinations: req.body.destinations,
          };

          var dispatcherTransactionObj = {
            dateTime: new Date(),
            transactionAmount: referralCost.getValue(),
            transactionType: "other",
            discription: "refferal earning",
            isATrip: false,
            isCredited: true,
            method: "cash",
            trip: tripToDispatcher,
          };
        }
      }

      var tripToDriver = {
        tripId: req.body.tripId,
        tripEarning: driverCost.getValue(),
        tripAdminCommission: adminCost.getValue(),
        totalTripValue: cost.getValue(),
        pickupLocation: req.body.realPickupLocation,
        destinations: req.body.destinations,
      };

      var tripToAdmin = {
        tripId: req.body.tripId,
        tripEarning: adminCost.getValue(),
        tripAdminCommission: adminCost.getValue(),
        totalTripValue: cost.getValue(),
        pickupLocation: req.body.realPickupLocation,
        destinations: req.body.destinations,
      };

      var tripToPassenger = {
        tripId: req.body.tripId,
        tripCost: cost.getValue(),
        totalTripValue: cost.getValue(),
        pickupLocation: req.body.realPickupLocation,
        destinations: req.body.destinations,
      };

      console.log("tripToDriver :" + tripToDriver);
      console.log("tripToAdmin :" + tripToAdmin);

      var driverTransactionObj = {
        dateTime: new Date(),
        transactionAmount: driverCost.getValue(),
        transactionType: "trip",
        isATrip: true,
        isCredited: true,
        method: "cash",
        trip: tripToDriver,
      };

      var companyTransactionObj = {
        dateTime: new Date(),
        transactionAmount: adminCost.getValue(),
        transactionType: "trip",
        isATrip: true,
        isCredited: false,
        method: "cash",
        trip: tripToAdmin,
      };

      var passengerTransactionObj = {
        dateTime: new Date(),
        transactionAmount: cost.getValue(),
        transactionType: "trip",
        isATrip: true,
        isCredited: false,
        method: "cash",
        trip: tripToPassenger,
      };

      WalletUpdate.DriverWalletUpdateAfterTripEnd(
        req.body.driverId,
        driverTransactionObj,
        adminCost.getValue(),
        driverCost.getValue()
      );
      WalletUpdate.CompanyWalletUpdateAfterTripEnd(
        companyTransactionObj,
        adminCost.getValue()
      );
      WalletUpdate.PassengerWalletUpdateAfterTripEnd(
        req.body.passengerId,
        passengerTransactionObj,
        cost.getValue()
      );
      if (dispatcherTransactionObj && referralType) {
        console.log("referral dispatcher wallet update");
        WalletUpdate.DispatcherWalletUpdateFromReferral(
          referredId,
          referralType,
          dispatcherTransactionObj,
          referralCost.getValue()
        );
      }
      if (referralDriverTransactionObj && referralType === "driver") {
        console.log("referral driver wallet update");
        WalletUpdate.DriverWalletUpdateFromReferral(
          referredId,
          referralDriverTransactionObj,
          referralCost.getValue()
        );
      }

      var newVals = {
        $set: {
          status: "done",
          distance: req.body.distance,
          hireCost: estimatedCost.getValue(),
          totalPrice: cost.getValue(),
          waitTime: req.body.waitTime,
          waitingCost: waitingCost.getValue(),
          dropDateTime: new Date(),
          tripTime: parseFloat(req.body.tripTime),
          realPickupLocation: req.body.realPickupLocation,
          realDropLocation: req.body.realDropLocation,
        },
      };

      Trip.findByIdAndUpdate(req.body.tripId, newVals, function (err, result) {
        if (err) {
          console.log("error3");
          res.status(500).send(err);
        } else {
          if (result == null) {
            console.log("block2");
            res.status(204).json();
          } else {
            PassengerTrack.findOne({
              passengerId: req.body.passengerId,
            }).exec(function (error1, passenger) {
              if (error1) {
                console.log("error in passenger tracking");
              } else {
                var passengerSocketObj = {
                  distance: req.body.distance,
                  totalPrice: cost.getValue(),
                  waitTime: req.body.waitTime,
                  waitingCost: req.body.waitingCost,
                  discount: 0,
                  dropDateTime: new Date(),
                  tripTime: parseFloat(req.body.tripTime),
                  socketId: passenger.socketId,
                  trip: result,
                };

                var msg = `You have arrived to destination. Trip time : ${req.body.tripTime}`;

                passengerSocket.sendTripEndDetailsToPassenger(
                  passengerSocketObj
                );

                /* author : ghost / push notification */
                PassengerPushNotification.sendTripEndPushNotificationToPassenger(
                  req.body.passengerId,
                  msg
                );
              }
            });

            console.log("success");
            res.status(200).json({
              message: "successfully end trip",
            });
          }
        }
      });
    } else {
      console.log("error3.1");
      res.status(500).json({
        message: "Server Error!",
      });
    }
  });
};

exports.getTripDetailsbyId = function (req, res) {
  Trip.findById(
    mongoose.Types.ObjectId(req.body.tripId),
    function (err, tripData) {
      if (err) {
        res.status(500).json({
          message: "Server Error!",
        });
      } else {
        if (tripData == null) {
          res.status(204).json();
        } else {
          console.log(tripData);
          res.status(200).json({
            message: "Success!",
            tripData,
          });
        }
      }
    }
  );
};

exports.findDriverForPassenger1 = function (req, res) {
  console.log("pass Details");
  //console.log(req.body)
  var trip = new Trip();
  trip.passengerDetails.id = req.body.passengerDetails.id;
  trip.passengerDetails.name = req.body.passengerDetails.name;
  trip.passengerDetails.email = req.body.passengerDetails.email;
  trip.passengerDetails.birthday = req.body.passengerDetails.birthday;
  trip.passengerDetails.nic = req.body.passengerDetails.nic;
  trip.passengerDetails.gender = req.body.passengerDetails.gender;
  trip.passengerDetails.contactNumber = req.body.passengerDetails.contactNumber;
  trip.passengerDetails.userProfilePic =
    req.body.passengerDetails.userProfilePic;
  // trip.noOfPassengers = req.body.noOfPassengers;
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
  trip.notes = req.body.notes;
  trip.type = req.body.type;
  trip.validTime = req.body.validTime;
  trip.status = "default";

  trip.save(function (err, result) {
    if (err) {
      console.log("#################### error occured #######################");
      console.log(err);
      res.status(500).send(err);
    } else {
      if (result != null) {
        // console.log(result)
        VehicleTracking.find({
          currentStatus: "online",
          vehicleSubCategory: req.body.vehicleSubCategory,
        }).exec(function (err, data) {
          if (err) {
            console.log("ERRR");
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
              //console.log(data)
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

              console.log("tempdrivers before sort");
              console.log(tempDrivers.length);

              tempDrivers.sort(
                (a, b) => parseFloat(b.bidValue) - parseFloat(a.bidValue)
              );

              console.log("tempdrivers after sort");
              //console.log(tempDrivers);

              // for (var i = 0; i < tempDrivers.length; i++) {
              //   if (tempDrivers[i].bidValue > req.body.bidValue) {
              //     console.log(tempDrivers[1].bidValue)
              //     tempDrivers.splice(i, 1);
              //   }
              // }

              var filtered = tempDrivers.filter(function (value, index, arr) {
                console.log(value.bidValue);
                return !(value.bidValue > 10);
              });

              console.log("filtered");
              console.log(filtered);

              tempDrivers.sort(
                (a, b) =>
                  parseFloat(a.distanceBetween) - parseFloat(b.distanceBetween)
              );
              notifiedDrivers = tempDrivers.slice(0, 5);

              console.log("tempdrivers after sort");
              //console.log(tempDrivers)

              notifiedDrivers.forEach((element) => {
                var trip = {
                  socketId: element.socketId,
                  trip: result,
                };
                DriverNotification.sendDispatchToDriver(trip);
              });

              if (notifiedDrivers.length > 0) {
                console.log("notified drivers");
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
                  if (err) {
                    res.status(500).send(err);
                  } else {
                    res.json({
                      message: "success",
                      details: "Your Request will Send to the drivers",
                      content: trip,
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
};

/* trip cancel by passenger */
exports.cancelTripByPassenger = function (req, res) {
  Trip.update(
    {
      _id: req.body.tripId,
    },
    {
      $set: {
        status: "canceled",
      },
      $push: {
        cancelDetails: {
          cancelReason: req.body.cancelReason,
          canceledPassengerId: req.body.passengerId,
        },
      },
    },
    function (error, trip) {
      if (error) {
        res.status(500).json({
          message: "Server Error!",
        });
      } else {
        if (trip) {
          VehicleTracking.findOne({
            driverId: req.body.driverId,
          }).exec(function (error1, driver) {
            if (error1) {
            } else {
              var cancelObj = {
                tripId: req.body.tripId,
                cancelReason: req.body.cancelReason,
                canceledPassengerId: req.body.passengerId,
                socketId: driver.socketId,
              };
              /* notify to driver */
              DriverNotification.sendLiveTripCancelToDriver(cancelObj);

              /* author : ghost - push notification */
              var msg = "Booking canceled because - " + req.body.cancelReason;
              DriverPushNotification.sendLiveTripCancelPushNotificationToDriver(
                req.body.driverId,
                msg
              );
            }
          });

          res.status(200).json({
            message: "success!",
          });
        } else {
          res.status(204).json();
        }
      }
    }
  );
};

/* dispatch cancel */
exports.cancelDispatch = function (req, res) {
  Trip.findOne({
    $and: [
      {
        _id: req.body.tripId,
      },
      {
        status: "default",
      },
      {
        assignedDriverId: null,
      },
      {
        assignedVehicleId: null,
      },
    ],
  }).exec(function (error1, tripData) {
    if (error1) {
      res.status(500).json({
        message: "Server Error!",
      });
    } else {
      if (tripData != null) {
        if (tripData.noifiedDrivers.length > 0) {
          tripData.noifiedDrivers.forEach((element) => {
            var trip = {
              socketId: element.socketId,
              trip: tripData,
            };

            /* remove drivers notifications */
            DriverNotification.removeDispatch(trip);
          });
        }

        Trip.update(
          {
            _id: req.body.tripId,
          },
          {
            $set: {
              status: "canceled",
            },
            $push: {
              cancelDetails: {
                cancelReason: req.body.cancelReason,
                canceledPassengerId: req.body.passengerId,
              },
            },
          },
          function (error, trip) {
            if (error) {
              res.status(500).json({
                message: "Server Error!",
              });
            } else {
              if (trip) {
                res.status(200).json({
                  message: "success",
                  details: "Dispatch canceled",
                });
              } else {
                res.status(204).json({
                  message: "failed",
                  details: "Dispatch cancel failed",
                });
              }
            }
          }
        );
      }
    }
  });
};
