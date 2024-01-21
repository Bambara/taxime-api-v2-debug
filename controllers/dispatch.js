"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var config = require("../config");
var Dispatch = require("../models/dispatch");
var DriverNotificationModel = require("../models/drivernotification");
var Dispatcher = require("../models/dispatcher");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var cryptoHandler = "../controllers/cryptoHandler";
var geolib = require("geolib");
var VehicleTracking = require("../models/vehicletracking");
var VehicleCategory = require("../models/vehiclecategory");
var sendSms = require("../services/sendSms");
var ManualCustomer = require("../models/manualcustomer");
var DispatcherNotifications = require("../models/dispatchernotifications");
var ManualCustomerUpdate = require("../services/manualCustomer");
var WalletUpdate = require("../services/walletUpdate");
var money = require("walletjs");

require("dotenv").config();

var Driver = require("../models/driver");
var Vehicle = require("../models/vehicle");
var Trip = require("../models/trip");

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

var DriverNotification = require("../services/driverNotifications");
var Notification = require("../models/drivernotification");

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

exports.Dispatch = function (req, res) {
  console.log("###### Dispatch ######");
  res.json({
    status: "dispatch",
  });
};

exports.DriverNotificationModel = function (req, res) {
  console.log("###### Dispatch ######");
  res.json({
    status: "driverNotification",
  });
};

//######################## get Dispatch price limit ###################
exports.getDispatchPriceLimit = function (req, res) {
  console.log("########### dispatch : getDispatchPriceLimit ###########");
  VehicleCategory.find({
    isEnable: true,
  }).exec(function (err, data) {
    if (err) {
      console.log("####### error occured");
    } else {
      if (data == null) {
        console.log(
          "####################### No Data Found ##########################"
        );
        res.status(400).json({
          message: "No Data Found ",
        });
      } else {
        /** filter */
        res.json({
          message: "success",
          details: "get category price data success",
          content: data,
        });
      }
    }
  });
};

exports.adminDispatch = function (req, res) {
  if (req.body.operationRadius) {
    //var date = req.body.pickupDate + 'T' + req.body.pickupTime + ':00.000Z';
    var pickupDnT = new Date();

    var dispatch = new Dispatch();
    // var desired = dropLocations[0].address.replace(/[^\w\s]/gi, '')
    // console.log(desired);
    dispatch.dispatcherId = req.body.dispatcherId;
    dispatch.customerName = req.body.customerName;
    dispatch.customerTelephoneNo = req.body.customerTelephoneNo;
    dispatch.noOfPassengers = req.body.noOfPassengers;
    dispatch.pickupDateTime = pickupDnT;
    dispatch.pickupLocation = req.body.pickupLocation;
    dispatch.dropLocations = req.body.dropLocations;
    dispatch.distance = req.body.distance;
    dispatch.bidValue = req.body.bidValue;
    dispatch.vehicleCategory = req.body.vehicleCategory;
    dispatch.vehicleSubCategory = req.body.vehicleSubCategory;
    dispatch.hireCost = req.body.hireCost;
    dispatch.totalPrice = req.body.totalPrice;
    dispatch.notes = req.body.notes;
    dispatch.validTime = req.body.validTime;
    dispatch.type = req.body.type;
    dispatch.status = "default";

    dispatch.save(function (err, result) {
      if (err) {
        console.log(
          "#################### error occured #######################"
        );
        console.log(err);
        res.status(500).send(err);
      } else {
        if (result != null) {
          var dispatchId = result.dispatcherId;
          console.log(result);
          result.pickupLocation.address = result.pickupLocation.address.replace(
            /[^a-zA-Z0-9,-\s!?]+/g,
            ""
          );
          result.dropLocations[0].address =
            result.dropLocations[0].address.replace(/[^a-zA-Z0-9,-\s!?]+/g, "");
          VehicleTracking.find({
            driverId: {
              $ne: req.body.dispatcherId,
            },
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

                var newValues1 = {
                  $set: {
                    status: "canceled",
                  },
                  $push: {
                    cancelDetails: {
                      cancelReason: "No online drivers",
                      canceledDriverId: null,
                    },
                  },
                };

                Dispatch.findByIdAndUpdate(
                  dispatch._id,
                  newValues1,
                  function (err, result) {
                    if (err) {
                      res.status(500).send(err);
                    } else {
                      if (result == null) {
                        res.status(204).json();
                      } else {
                        res.status(203).json({
                          message: "failed",
                          details: "No online Drivers",
                        });
                      }
                    }
                  }
                );
              } else {
                console.log(data);
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
                  } else {
                    console.log("point not inside");
                  }
                });

                tempDrivers.sort(
                  (a, b) =>
                    parseFloat(a.distanceBetween) -
                    parseFloat(b.distanceBetween)
                );

                notifiedDrivers = tempDrivers.slice(0, 4);

                if (tempDrivers.length > 0)
                  console.log("temp drivers available");

                notifiedDrivers.forEach((element) => {
                  var trip = {
                    socketId: element.socketId,
                    trip: result,
                  };
                  DriverNotification.sendDispatchToDriver(trip);
                });

                if (notifiedDrivers.length > 0) {
                  console.log("notified drivers");
                  console.log(tempDrivers);
                  Dispatch.update(
                    {
                      _id: dispatch._id,
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
                      var customerObj = {
                        customerTelephoneNo: req.body.customerTelephoneNo,
                        customerName: req.body.customerName,
                      };

                      ManualCustomerUpdate.saveManualCustomer(customerObj);

                      res.json({
                        message: "success",
                        details: "Your Request will Send to the drivers",
                        content: dispatch,
                      });
                    }
                  });
                } else {
                  var newValues2 = {
                    $set: {
                      status: "canceled",
                    },
                    $push: {
                      cancelDetails: {
                        cancelReason: "No online drivers",
                        canceledDriverId: null,
                      },
                    },
                  };

                  Dispatch.findByIdAndUpdate(
                    dispatch._id,
                    newValues2,
                    function (err, result) {
                      if (err) {
                        res.status(500).send(err);
                      } else {
                        if (result == null) {
                          res.status(204).json();
                        } else {
                          var customerObj = {
                            customerTelephoneNo: req.body.customerTelephoneNo,
                            customerName: req.body.customerName,
                          };

                          ManualCustomerUpdate.saveManualCustomer(customerObj);

                          res.status(202).json({
                            message: "failed",
                            details: "No drivers in this area",
                          });
                        }
                      }
                    }
                  );
                }
              }
            }
          });
        }
      }
    });
  } else {
    res.status(500).json({
      message: "req.body.operationRadius not available",
    });
  }
};

exports.addDispatch = function (req, res) {
  console.log("########## dispatch : addDispatch ##########");
  console.log(req.body);

  //var date = req.body.pickupDate + 'T' + req.body.pickupTime + '.000Z';
  var pickupDnT = new Date();

  /* create dispatch modal object */
  var dispatch = new Dispatch();

  dispatch.dispatcherId = req.body.dispatcherId;
  dispatch.customerName = req.body.customerName;
  dispatch.customerTelephoneNo = req.body.customerTelephoneNo;
  dispatch.noOfPassengers = req.body.noOfPassengers;
  dispatch.pickupDateTime = pickupDnT;
  dispatch.pickupLocation = req.body.pickupLocation;
  dispatch.dropLocations = req.body.dropLocations;
  dispatch.distance = req.body.distance;
  dispatch.bidValue = req.body.hireCost;
  dispatch.vehicleCategory = req.body.vehicleCategory;
  dispatch.vehicleSubCategory = req.body.vehicleSubCategory;
  dispatch.hireCost = req.body.totalPrice;
  dispatch.totalPrice = 0;
  dispatch.notes = req.body.notes;
  dispatch.type = req.body.type;
  dispatch.validTime = req.body.validTime;
  dispatch.status = "default";

  /* save dispatch data */
  dispatch.save(function (err, result) {
    if (err) {
      console.log("#################### error occured #######################");
      console.log(err);
      res.status(500).send(err);
    } else {
      if (result != null) {
        /* set location data */
        result.pickupLocation.address = result.pickupLocation.address.replace(
          /[^a-zA-Z0-9,-\s!?]+/g,
          ""
        );
        result.dropLocations[0].address =
          result.dropLocations[0].address.replace(/[^a-zA-Z0-9,-\s!?]+/g, "");

        var dispatchId = result.dispatcherId;
        // console.log(result)

        /* find drivers */
        VehicleTracking.find({
          driverId: {
            $ne: req.body.dispatcherId,
          },
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

              /* update db as pending dispatch trip */
              var newValues1 = {
                $set: {
                  status: "canceled",
                },
                $push: {
                  cancelDetails: {
                    cancelReason: "No online drivers",
                    canceledDriverId: null,
                  },
                },
              };

              Dispatch.findByIdAndUpdate(
                dispatch._id,
                newValues1,
                function (err, result) {
                  if (err) {
                    res.status(500).send(err);
                  } else {
                    if (result == null) {
                      res.status(204).json();
                    } else {
                      res.status(203).json({
                        message: "failed",
                        details: "No online Drivers",
                      });
                    }
                  }
                }
              );
            } else {
              console.log(data);

              /* filter online drivers near to pickup location using geolib */
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

              console.log(
                "####################### tempdrivers #######################"
              );
              console.log(tempDrivers);

              /* sort drivers according to distance */
              tempDrivers.sort(
                (a, b) =>
                  parseFloat(a.distanceBetween) - parseFloat(b.distanceBetween)
              );
              /* get first 3 drivers */
              notifiedDrivers = tempDrivers.slice(0, 4);

              notifiedDrivers.forEach((element) => {
                var trip = {
                  socketId: element.socketId,
                  trip: result,
                };
                DriverNotification.sendDispatchToDriver(trip);
              });

              /* save notified drivers */
              if (notifiedDrivers.length > 0) {
                console.log(
                  "####################### notified drivers #######################"
                );
                console.log(notifiedDrivers);

                Dispatch.update(
                  {
                    _id: dispatch._id,
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
                    /* save manual customer to db */
                    var customerObj = {
                      customerTelephoneNo: req.body.customerTelephoneNo,
                      customerName: req.body.customerName,
                    };

                    ManualCustomerUpdate.saveManualCustomer(customerObj);

                    res.json({
                      message: "success",
                      details: "Your Request will Send to the drivers",
                      content: dispatch,
                    });
                  }
                });
              } else {
                /* update db as pending dispatch trip */
                var newValues2 = {
                  $set: {
                    status: "canceled",
                  },
                  $push: {
                    cancelDetails: {
                      cancelReason: "No online drivers",
                      canceledDriverId: null,
                    },
                  },
                };

                Dispatch.findByIdAndUpdate(
                  dispatch._id,
                  newValues2,
                  function (err, result) {
                    if (err) {
                      res.status(500).send(err);
                    } else {
                      if (result == null) {
                        res.status(204).json();
                      } else {
                        /* save manual customer to db */
                        var customerObj = {
                          customerTelephoneNo: req.body.customerTelephoneNo,
                          customerName: req.body.customerName,
                        };

                        ManualCustomerUpdate.saveManualCustomer(customerObj);

                        res.status(202).json({
                          message: "failed",
                          details: "No drivers in this area",
                        });
                      }
                    }
                  }
                );
              }
            }
          }
        });
      }
    }
  });
};

exports.driverAcceptDispatch = function (req, res) {
  console.log("########### dispatch : driverAcceptDispatch ###########");

  /* set driver id ,vehicle id and trip accepted status */
  var newVals = {
    $set: {
      assignedDriverId: req.body.driverId,
      assignedVehicleId: req.body.vehicleId,
      status: "accepted",
    },
  };

  /* get dispatcher data by dispatcher id */
  Dispatcher.findOne({
    dispatcherId: req.body.dispatcherId,
  }).exec(function (err, dispatcherResult) {
    if (err) {
      res.status(500).send(err);
    } else {
      var dispatcher = {};
      dispatcher = dispatcherResult;
      console.log("inside dispatcher");

      /* get dispatch trip data */
      Dispatch.findOne({
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
            console.log(req.body.vehicleSubCategory);
            console.log(req.body.vehicleCategory);

            if (req.body.vehicleSubCategory) {
              /* get vehicleCategory data  */
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

                    /* get pickup location data from geocoder */
                    geocoder.reverse(
                      {
                        lat: req.body.pickupLocation.latitude,
                        lon: req.body.pickupLocation.longitude,
                      },
                      function (err1, resp) {
                        // geocoder.geocode(req.body.pickupLocation.address, function (err1, resp) {
                        console.log("****** district ****** ", resp);
                        if (err1) {
                          console.error(err1);
                          //res.status(500).send(err1);
                        }

                        var district = resp[0].administrativeLevels.level2long;
                        /* comment by ghost - 03/03 */
                        //var district = 'Colombo';

                        if (!district) {
                          district = "Colombo";
                        }

                        if (district == null) {
                          console.error("district is null");
                          res.status(203).json({
                            message: "Can not find district",
                          });
                        } else {
                          var responseData = [];
                          console.log("#### category[0] ####");
                          console.log(category[0]);

                          /* check subCategory */
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
                            console.log(subCatData);

                            var temp = null;
                            temp = subCatData.priceSelection.find(
                              (el) => el.districtName == district
                            );
                            var defaultTimeBase = temp.timeBase[0];
                            if (temp != null || temp.length == 0) {
                              var timeBaseSelected = {};
                              temp.timeBase.forEach((ele) => {
                                var start =
                                  parseInt(ele.startingTime.split(":")[0]) *
                                    60 +
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

                              /* set respose data */
                              responseData.push(timeBaseSelected);

                              /* update dispatch trip by id */
                              Dispatch.findByIdAndUpdate(
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

                                        /* set location data */
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

                                        /* remove dispatch notification from notified drivers */
                                        result.noifiedDrivers.forEach(
                                          (element) => {
                                            //console.log(element)
                                            // if (element.driverId != req.body.driverId && element.vehicleId != req.body.vehicleId) {
                                            var trip = {
                                              socketId: element.socketId,
                                              trip: result,
                                            };
                                            DriverNotification.removeDispatch(
                                              trip
                                            );
                                            // }
                                          }
                                        );

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
                                                    } else {
                                                      var msg = `Your booking is confirmed. Driver will arrive shortly. Driver : ${driverData.firstName} ${driverData.lastName}, ContactNo : ${driverData.mobile}, VehicleNo : ${vehicleData.vehicleRegistrationNo}`;
                                                      console.error(msg);
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

                                                      /* ghost commented */
                                                      // sendSms.sendMsg(req.body.customerTelephoneNo, msg);
                                                    }
                                                  }
                                                );
                                              }
                                            }
                                          );
                                        }

                                        res.json({
                                          message: "success",
                                          details: "start trip Successfully",
                                          content: responseData,
                                          // content2: dispatcher
                                        });
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
          }
        }
      });
    }
  });
};

exports.cancelDispatch = function (req, res) {
  console.log("########## dispatch : cancelDispatch ##########");

  var newVals = {
    $set: {
      status: "canceled",
      cancelReason: "Canceled by driver",
    },
  };

  Dispatch.findByIdAndUpdate(
    req.body.dispatchId,
    newVals,
    function (err, result) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (result == null) {
          res.status(204).json();
        } else {
          res.status(200).json({
            message: "dispatch canceled.",
          });
        }
      }
    }
  );
};

exports.cancelTrip = function (req, res) {
  var cost1 = Math.round(req.body.cancelCost);
  var cost = money.Money.init(req.body.cancelCost);
  var estimatedCost = money.Money.init(req.body.estimatedCost);

  if (
    req.body.type == "driverDispatch" ||
    req.body.type == "userDispatch" ||
    req.body.type == "adminDispatch"
  ) {
    Dispatch.update(
      {
        _id: tripId,
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
            transactionAmount: cost,
            transactionType: "other",
            isATrip: true,
            isCredited: false,
            method: "cash",
            discription: "Trip cancel by driver",
            trip: tripToDriver,
          };

          var companyTransactionObj = {
            dateTime: new Date(),
            transactionAmount: adminCost,
            transactionType: "other",
            isATrip: true,
            isCredited: true,
            method: "cash",
            discription: "Trip cancel by driver",
            trip: tripToAdmin,
          };

          WalletUpdate.DriverWalletUpdateForTripCancel(
            req.body.driverId,
            driverTransactionObj,
            cost.getValue()
          );
          WalletUpdate.CompanyWalletUpdateForTripCancel(
            companyTransactionObj,
            cost.getValue()
          );

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

exports.endDispatch1 = function (req, res) {
  var newVals = {
    $set: {
      status: "done",
      distance: req.body.distance,
      hireCost: req.body.estimatedCost,
      totalPrice: req.body.totalCost,
      waitTime: req.body.waitTime,
      waitingCost: req.body.waitingCost,
      dropDateTime: new Date(),
    },
  };

  if (req.body.type == "driverDispatch") {
    Dispatch.findByIdAndUpdate(
      req.body.dispatchId,
      newVals,
      function (err, result) {
        if (err) {
          res.status(500).send(err);
        } else {
          if (result == null) {
            res.status(204).json();
          } else {
            res.status(200).json({
              message: "successfully end trip",
            });
          }
        }
      }
    );
  } else if (req.body.type == "adminDispatch") {
    Dispatch.findByIdAndUpdate(
      req.body.dispatchId,
      newVals,
      function (err, result) {
        if (err) {
          res.status(500).send(err);
        } else {
          if (result == null) {
            res.status(204).json();
          } else {
            res.status(200).json({
              message: "successfully end trip",
            });
          }
        }
      }
    );
  }
};

exports.getEstimatedCost = function (req, res) {
  console.log("########## dispatch : getEstimatedCost ##########");
  console.log(req.body);

  /* check category */
  if (req.body.subCategory) {
    VehicleCategory.find({
      isEnable: true,
      categoryName: req.body.categoty,
    }).exec(function (err, category) {
      if (err) {
        console.log("####### error occured" + err);
        res.status(400).send("error");
      } else {
        if (category == null || category.length == 0) {
          res.status(400).json({
            message: "failed",
            details: "No data found",
            status: "failed",
          });
        } else {
          /* check subCategory */
          var subCatData = category[0].subCategory.find(
            (el) => (el.subCategoryName = req.body.subCategory)
          );

          var mins =
            parseInt(req.body.pickupTime.split(":")[0]) * 60 +
            parseInt(req.body.pickupTime.split(":")[1]);

          geocoder.geocode(req.body.address, function (err, resp) {
            if (err) {
              console.log("error in geocoder");
              res.status(500).send(err);
            }

            console.log(resp[0].administrativeLevels.level2long);
            /* set district */
            var district = resp[0].administrativeLevels.level2long;

            var timeBaseSelected = {};

            /* get price data by district */
            var temp = subCatData.priceSelection.find(
              (el) => el.districtName == district
            );

            if (temp) {
              temp.timeBase.forEach((element2) => {
                var start =
                  parseInt(element2.startingTime.split(":")[0]) * 60 +
                  parseInt(element2.startingTime.split(":")[1]);
                var end =
                  parseInt(element2.endingTime.split(":")[0]) * 60 +
                  parseInt(element2.endingTime.split(":")[1]);

                console.log(start + "------" + end);

                if (start < end) {
                  if (mins >= start && mins <= end) {
                    timeBaseSelected = element2;
                  }
                } else {
                  if (mins >= start && mins >= end) {
                    timeBaseSelected = element2;
                  }
                }
              });
            }

            /* calculate cost */
            var total = 0;
            var estimatedCostResponse = {};

            console.log(req.body.biddingPrice);
            console.log(req.body.distance);
            console.log(
              "***",
              req.body.distance > timeBaseSelected.belowAboveKMRange
            );

            if (req.body.distance <= timeBaseSelected.minimumKM) {
              console.log("11111111");
              total =
                timeBaseSelected.districtPrice + timeBaseSelected.minimumFare;
            } else if (
              req.body.distance <= timeBaseSelected.belowAboveKMRange
            ) {
              console.log("2222222");
              total =
                timeBaseSelected.districtPrice +
                timeBaseSelected.minimumFare +
                req.body.biddingPrice *
                  (req.body.distance - timeBaseSelected.minimumKM);
            } else if (req.body.distance > timeBaseSelected.belowAboveKMRange) {
              console.log("333333");
              total =
                timeBaseSelected.districtPrice +
                timeBaseSelected.minimumFare +
                (req.body.biddingPrice *
                  (timeBaseSelected.belowAboveKMRange -
                    timeBaseSelected.minimumKM) +
                  timeBaseSelected.aboveKMFare *
                    (req.body.distance - timeBaseSelected.belowAboveKMRange));
            }

            // console.log(timeBaseSelected)

            estimatedCostResponse = {
              estimatedCost: total,
              timeBaseData: timeBaseSelected,
            };

            res.json({
              message: "success",
              details: "get estimated cost Successfully",
              content: estimatedCostResponse,
            });
          });
        }
      }
    });
  } else {
    res.status(502).json({
      message: "failed",
      details: "No sub category data Provided for get estimated cost",
      status: "failed",
    });
  }
};

exports.getDispatches = function (req, res) {
  var fromDate = new Date(req.params.from);
  var toDate = new Date(req.params.to);

  Dispatch.aggregate({
    $match: {
      $and: [
        {
          $or: [
            {
              status: "done",
            },
          ],
        },

        {
          pickupDateTime: {
            $gte: fromDate,
            $lt: toDate,
          },
        },
      ],
    },
    // $match: {
    //   pickupDateTime: {
    //     $gte: fromDate,
    //     $lt: toDate
    //   }
    // }
  }).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      Trip.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    status: "done",
                  },
                ],
              },
              {
                recordedTime: {
                  $gte: fromDate,
                  $lt: toDate,
                },
              },
            ],
          },
        },
      ]).exec(function (err, result1) {
        if (err) {
          res.status(500).send(err);
        } else {
          result1.forEach((element) => {
            result.push(element);
          });

          res.status(200).json({
            content: result,
            content1: [],
          });
        }
      });
      // res.status(200).json({
      //   content: result
      // })
    }
  });
};

exports.getFailedDispatches = function (req, res) {
  var fromDate = new Date(req.params.from);
  var toDate = new Date(req.params.to);

  Dispatch.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                status: "canceled",
              },
              {
                status: "default",
              },
              {
                status: "accepted",
              },
            ],
          },

          {
            pickupDateTime: {
              $gte: fromDate,
              $lt: toDate,
            },
          },
        ],
      },

      // $match: {
      //   $and : [
      //     {status: 'canceled'},
      //     {pickupDateTime: { $gte: fromDate, $lt: toDate }}
      //   ]
      // }
    },
  ]).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      Trip.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    status: "canceled",
                  },
                  {
                    status: "default",
                  },
                  {
                    status: "accepted",
                  },
                ],
              },
              {
                recordedTime: {
                  $gte: fromDate,
                  $lt: toDate,
                },
              },
            ],
          },
        },
      ]).exec(function (err, result1) {
        if (err) {
          res.status(500).send(err);
        } else {
          result1.forEach((element) => {
            result.push(element);
          });

          res.status(200).json({
            content: result,
            content1: [],
          });
        }
      });

      // res.status(200).json({
      //   content: result
      // })
    }
  });
};

exports.getdispatchpagination = function (req, res) {
  var fromDate = new Date(req.params.from);
  var toDate = new Date(req.params.to);

  var pageNo = req.params.pageNo;
  var paginationCount = 10;
  var responseData;
  var param = req.params.param;

  Dispatch.aggregate({
    $match: {
      $and: [
        {
          $or: [
            {
              status: "done",
            },
          ],
        },
        {
          pickupDateTime: {
            $gte: fromDate,
            $lt: toDate,
          },
        },
        {
          [param]: { $regex: req.params.text },
        },
      ],
    },
    // $match: {
    //   pickupDateTime: {
    //     $gte: fromDate,
    //     $lt: toDate
    //   }
    // }
  }).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      Trip.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    status: "done",
                  },
                ],
              },
              {
                recordedTime: {
                  $gte: fromDate,
                  $lt: toDate,
                },
              },
            ],
          },
        },
      ]).exec(function (err, result1) {
        if (err) {
          res.status(500).send(err);
        } else {
          // responseData = drivers.slice(((pageNo - 1) * paginationCount), (pageNo * paginationCount));

          result1.forEach((element) => {
            result.push(element);
          });

          res.status(200).json({
            content: result,
            content1: result1,
          });
        }
      });
      // res.status(200).json({
      //   content: result
      // })
    }
  });
};

exports.getFailedDispatchespagination = function (req, res) {
  var fromDate = new Date(req.params.from);
  var toDate = new Date(req.params.to);
  console.log(req.params.from);
  if (req.params.from === "undefined" && req.params.to === "undefined") {
    var today = new Date();
    var today1 = new Date();
    today1.setDate(today.getDate() + 1);

    toDate =
      today1.getFullYear() +
      "-" +
      (today1.getMonth() + 1 > 9 ? "" : "0") +
      (today1.getMonth() + 1) +
      "-" +
      (today1.getDate() > 9 ? "" : "0") +
      today1.getDate();
    toDate = new Date(toDate);
  }

  var pageNo = req.params.pageNo;
  var paginationCount = 15;

  var status = req.params.status;
  var category = req.params.category;

  var query1 = {
    $match: {
      $and: [
        {
          $or: [],
        },
        {
          $or: [
            {
              customerName: { $regex: req.params.text },
            },
            {
              customerTelephoneNo: { $regex: req.params.text },
            },
            {
              "pickupLocation.address": { $regex: req.params.text },
            },
            {
              "realDropLocation.address": { $regex: req.params.text },
            },
            {
              "realPickupLocation.address": { $regex: req.params.text },
            },
            // {
            //   "dropLocations.address" : { $regex: req.params.text }
            // },
            // {
            //   type: { $regex: req.params.text }
            // }
          ],
        },
        {
          pickupDateTime: {
            $gte: fromDate,
            $lt: toDate,
          },
        },
      ],
    },
  };

  if (status == "all") {
    query1.$match.$and[0].$or.push(
      {
        status: "canceled",
      },
      {
        status: "default",
      },
      {
        status: "accepted",
      },
      {
        status: "done",
      }
    );
  } else {
    query1.$match.$and[0].$or.push({
      status: status,
    });
  }

  if (category != "all") {
    query1.$match.$and.push({
      vehicleSubCategory: category,
    });
  }

  Dispatch.aggregate([query1]).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      var query2 = {
        $match: {
          $and: [
            {
              $or: [],
            },
            {
              $or: [
                {
                  "passengerDetails.name": { $regex: req.params.text },
                },
                {
                  "passengerDetails.contactNumber": { $regex: req.params.text },
                },
                {
                  "pickupLocation.address": { $regex: req.params.text },
                },
                {
                  "realDropLocation.address": { $regex: req.params.text },
                },
                {
                  "realPickupLocation.address": { $regex: req.params.text },
                },
                // {
                //   "dropLocations.address" : { $regex: req.params.text }
                // },
                // {
                //   type: { $regex: req.params.text }
                // }
              ],
            },
            {
              recordedTime: {
                $gte: fromDate,
                $lt: toDate,
              },
            },
          ],
        },
      };

      if (status == "all") {
        query2.$match.$and[0].$or.push(
          {
            status: "canceled",
          },
          {
            status: "default",
          },
          {
            status: "accepted",
          },
          {
            status: "done",
          }
        );
      } else {
        query2.$match.$and[0].$or.push({
          status: status,
        });
      }

      if (category != "all") {
        query2.$match.$and.push({
          vehicleSubCategory: category,
        });
      }

      Trip.aggregate([query2]).exec(function (err, result1) {
        if (err) {
          res.status(500).send(err);
        } else {
          result1.forEach((element) => {
            result.push(element);
          });

          result.sort((el1, el2) => {
            if (el1.recordedTime > el2.recordedTime) return -1;
            if (el1.recordedTime < el2.recordedTime) return 1;
          });
          var total = result.length;
          result = result.slice(
            (pageNo - 1) * paginationCount,
            pageNo * paginationCount
          );

          res.status(200).json({
            content: result,
            content1: [],
            total: total,
            query1: query1,
            query2: query2,
          });
        }
      });

      // res.status(200).json({
      //   content: result
      // })
    }
  });
};

exports.endDispatch = function (req, res) {
  console.log("########## dispatch : endDispatch ##########");
  console.log(req.body);

  /* money variable from walletjs */
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

  if (req.body.type == "driverDispatch" || req.body.type == "userDispatch") {
    console.log("driverDispatch or userDispatch");
    //console.log(req.body);

    var dispatcherType;

    if (req.body.type == "driverDispatch") {
      dispatcherType = "Driver";
    } else if (req.body.type == "userDispatch") {
      dispatcherType = "User";
    }

    Dispatcher.findOne({
      dispatcherId: req.body.dispatcherId,
    }).exec(function (err, dispatcherObj) {
      if (err) {
        console.log("server error");
        res.status(500).send(err);
      } else {
        if (dispatcherObj == null) {
          console.log("block1");

          /* admin commission calculate */
          var adminCpecentage = adminCommission.divideBy(100);
          var adminCost = cost.multiplyBy(adminCpecentage);
          var acost = money.Money.init(adminCost);
          var driverCost = cost.subtract(acost);

          /* set driver income from trip */
          var tripToDriver = {
            tripId: req.body.dispatchId,
            tripEarning: driverCost.getValue(),
            tripAdminCommission: adminCost.getValue(),
            totalTripValue: cost.getValue(),
            pickupLocation: req.body.realPickupLocation,
            destinations: req.body.destinations,
          };

          /* set admin income from trip */
          var tripToAdmin = {
            tripId: req.body.dispatchId,
            tripEarning: adminCost.getValue(),
            tripAdminCommission: adminCost.getValue(),
            totalTripValue: cost.getValue(),
            pickupLocation: req.body.realPickupLocation,
            destinations: req.body.destinations,
          };

          /* update wallets */

          var driverTransactionObj = {
            dateTime: new Date(),
            transactionAmount: driverCost.getValue(),
            transactionType: "dispatch",
            isATrip: true,
            isCredited: true,
            method: "cash",
            trip: tripToDriver,
          };

          var companyTransactionObj = {
            dateTime: new Date(),
            transactionAmount: adminCost.getValue(),
            transactionType: "dispatch",
            isATrip: true,
            isCredited: true,
            method: "cash",
            trip: tripToAdmin,
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

          /* update dispatch trip */
          Dispatch.findByIdAndUpdate(
            req.body.dispatchId,
            newVals,
            function (err, result) {
              if (err) {
                res.status(500).send(err);
              } else {
                if (result == null) {
                  console.log("block2");
                  res.status(204).json();
                } else {
                  res.status(200).json({
                    message: "successfully end trip",
                  });
                }
              }
            }
          );
        } else {
          /* set dispatcher commission data */
          var dispatcherCommission = money.Money.init(
            dispatcherObj.commission.dispatcherCommission
          );
          var dispatchAdminCommission = money.Money.init(
            dispatcherObj.commission.dispatchAdminCommission
          );

          /* get pecentage values */
          var adminCpecentage = dispatchAdminCommission.divideBy(100);
          var dispatcherCpecentage = dispatcherCommission.divideBy(100);

          /* calculate commission costs */
          var dispatcherCost = cost.multiplyBy(dispatcherCpecentage);
          var adminCost = cost.multiplyBy(adminCpecentage);

          var disCo = money.Money.init(dispatcherCost);
          var totalSubCost = disCo.add(adminCost);
          var driverCost = cost.subtract(totalSubCost);

          console.log("dispatcherCost : " + dispatcherCost.getValue());
          console.log("adminCost : " + adminCost.getValue());
          console.log("driverCost : " + driverCost.getValue());

          var tripToDriver = {
            tripId: req.body.dispatchId,
            tripEarning: driverCost.getValue(),
            tripAdminCommission: totalSubCost.getValue(),
            totalTripValue: cost.getValue(),
            pickupLocation: req.body.realPickupLocation,
            destinations: req.body.destinations,
          };

          var tripToDispatcher = {
            tripId: req.body.dispatchId,
            tripEarning: dispatcherCost.getValue(),
            tripAdminCommission: 0,
            totalTripValue: cost.getValue(),
            pickupLocation: req.body.realPickupLocation,
            destinations: req.body.destinations,
          };

          var tripToAdmin = {
            tripId: req.body.dispatchId,
            tripEarning: adminCost.getValue(),
            tripAdminCommission: adminCost.getValue(),
            totalTripValue: cost.getValue(),
            pickupLocation: req.body.realPickupLocation,
            destinations: req.body.destinations,
          };

          /* update wallets */

          var driverTransactionObj = {
            dateTime: new Date(),
            transactionAmount: driverCost.getValue(),
            transactionType: "dispatch",
            isATrip: true,
            isCredited: true,
            method: "cash",
            trip: tripToDriver,
          };

          var dispatcherTransactionObj = {
            dateTime: new Date(),
            transactionAmount: dispatcherCost.getValue(),
            transactionType: "dispatch",
            isATrip: true,
            isCredited: true,
            method: "cash",
            trip: tripToDispatcher,
          };

          var companyTransactionObj = {
            dateTime: new Date(),
            transactionAmount: adminCost.getValue(),
            transactionType: "dispatch",
            isATrip: true,
            isCredited: true,
            method: "cash",
            trip: tripToAdmin,
          };

          WalletUpdate.DriverWalletUpdateAfterDispatchpEnd(
            req.body.driverId,
            driverTransactionObj,
            totalSubCost.getValue(),
            driverCost.getValue()
          );
          WalletUpdate.DispatcherWalletUpdateAfterTripEnd(
            req.body.dispatcherId,
            dispatcherType,
            dispatcherTransactionObj,
            dispatcherCost.getValue()
          );
          WalletUpdate.CompanyWalletUpdateAfterTripEnd(
            companyTransactionObj,
            adminCost.getValue()
          );

          /* update dispatch trip */
          Dispatch.findByIdAndUpdate(
            req.body.dispatchId,
            newVals,
            function (err, result) {
              if (err) {
                console.log("block2.3");
                res.status(500).send(err);
              } else {
                if (result == null) {
                  console.log("block2.1");
                  res.status(204).json();
                } else {
                  console.log("block2.2");
                  res.status(200).json({
                    message: "successfully end trip",
                  });
                }
              }
            }
          );
        }
      }
    });
  } else if (req.body.type == "adminDispatch") {
    console.log("########## adminDispatch ##########");
    //console.log(req.body);

    var adminCpecentage = adminCommission.divideBy(100);
    var adminCost = cost.multiplyBy(adminCpecentage);
    var acost = money.Money.init(adminCost);
    var driverCost = cost.subtract(acost);

    console.log("adminCost : " + adminCost.getValue());
    console.log("driverCost : " + driverCost.getValue());

    var tripToDriver = {
      tripId: req.body.dispatchId,
      tripEarning: driverCost.getValue(),
      tripAdminCommission: adminCost.getValue(),
      totalTripValue: cost.getValue(),
      pickupLocation: req.body.realPickupLocation,
      destinations: req.body.destinations,
    };

    var tripToAdmin = {
      tripId: req.body.dispatchId,
      tripEarning: adminCost.getValue(),
      tripAdminCommission: adminCost.getValue(),
      totalTripValue: cost.getValue(),
      pickupLocation: req.body.realPickupLocation,
      destinations: req.body.destinations,
    };

    /* update wallets */

    var driverTransactionObj = {
      dateTime: new Date(),
      transactionAmount: driverCost.getValue(),
      transactionType: "dispatch",
      isATrip: true,
      isCredited: true,
      method: "cash",
      trip: tripToDriver,
    };

    var companyTransactionObj = {
      dateTime: new Date(),
      transactionAmount: adminCost.getValue(),
      transactionType: "dispatch",
      isATrip: true,
      isCredited: true,
      method: "cash",
      trip: tripToAdmin,
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

    /* update dispatch trip */
    Dispatch.findByIdAndUpdate(
      req.body.dispatchId,
      newVals,
      function (err, result) {
        if (err) {
          console.log("error3");
          res.status(500).send(err);
        } else {
          if (result == null) {
            console.log("block2");
            res.status(204).json();
          } else {
            console.log("success");
            res.status(200).json({
              message: "successfully end trip",
            });
          }
        }
      }
    );
  } else {
    console.log("error3.1");
    res.status(500).json({
      message: "Server Error!",
    });
  }
};
