"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var Driver = require("../models/driver");
var Dispatcher = require("../models/dispatcher");
var bcrypt = require("bcryptjs");
var User = require("../models/user");
var DispatcherWallet = require("../models/dispatcherwallet");
var ObjectId = require("mongodb").ObjectID;
var passengerSocket = require("../services/passengerNotifications");
var PassengerPushNotification = require("../services/passengerPushNotifications");
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

exports.dispatcher = function (req, res) {
  console.log("###### Admin ######");
  res.json({
    status: "dispatcher",
  });
};

exports.getDispatcherDataById = function (req, res) {
  console.log("###### get dispatcher data #######");

  Dispatcher.findOne({
    dispatcherId: new ObjectId(req.body.dispatcherId),
  }).exec(function (err, dispatcher) {
    if (err) {
      console.log("####### error occured" + err);
      res.send("error");
    } else {
      if (dispatcher !== null) {
        console.log(
          "####################### not an null data ##########################"
        );

        let commission = {
          fromDate: dispatcher.commission.fromDate,
          toDate: dispatcher.commission.toDate,
          dispatchAdminCommission:
            dispatcher.commission.dispatchAdminCommission,
          dispatcherCommission: dispatcher.commission.dispatcherCommission,
        };

        let dispatcherInfo = {
          dispatcherCode: dispatcher.dispatcherCode,
          dispatcherId: dispatcher.dispatcherId,
          type: dispatcher.type,
          recordedTime: dispatcher.recordedTime,
          commission: commission,
          isEnable: dispatcher.isEnable,
          dispatchPackageType: dispatcher.dispatchPackageType,
        };

        console.log(dispatcherInfo);

        res.status(200).json({
          message: "success",
          details: "dispatcher data retrived successfully",
          content: dispatcherInfo,
        });
      } else {
        console.log(
          "####################### null data ##########################"
        );
        res.status(403).json({
          message: "failed",
          details: "dispatcher not found",
          content: null,
        });
      }
    }
  });
};

exports.getDispatchers = function (req, res) {
  Dispatcher.find({})
    .populate("dispatcherId", "-otpPin -otpTime -saltSecret")
    .exec(function (err, dispatchers) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (dispatchers != null) {
          res.status(200).json({
            message: "success!",
            content: dispatchers,
          });
        } else {
          res.status(204).json();
        }
      }
    });
};

exports.getDispatcherspagination = function (req, res) {
  var pageNo = req.body.pageNo;
  var paginationCount = req.body.paginationCount;
  var responseData;
  var param = req.body.param;
  // [param]: { $regex: req.body.text }
  Dispatcher.find({})
    .populate("dispatcherId", "-otpPin -otpTime -saltSecret")
    .sort({ recordedTime: -1 })
    .exec(function (err, dispatchers) {
      if (err) {
        res.status(500).send(err);
      } else {
        const regex = new RegExp(`(${req.body.text}.*?e)`, "g");
        console.log(regex);

        if (dispatchers != null) {
          dispatchers = dispatchers.filter((el) => el.dispatcherId != null);
          if (param == "firstName") {
            dispatchers = dispatchers.filter(
              (el) =>
                (el.type == "User" &&
                  el.dispatcherId.name.includes(req.body.text)) ||
                (el.type == "Driver" &&
                  el.dispatcherId.firstName.includes(req.body.text))
            );
          } else if (param == "mobile") {
            dispatchers = dispatchers.filter(
              (el) =>
                (el.type == "User" &&
                  el.dispatcherId.contactNumber.includes(req.body.text)) ||
                (el.type == "Driver" &&
                  el.dispatcherId.mobile.includes(req.body.text))
            );
          } else if (param == "nic") {
            // (el.type == 'User') && (el.dispatcherId.nic.includes(req.body.text)) ||
            dispatchers = dispatchers.filter(
              (el) =>
                el.type == "Driver" &&
                el.dispatcherId.nic.includes(req.body.text)
            );
          } else if (param == "email") {
            // (el.type == 'User') && (el.dispatcherId.email.includes(req.body.text)) ||
            dispatchers = dispatchers.filter(
              (el) =>
                el.type == "Driver" &&
                el.dispatcherId.email.includes(req.body.text)
            );
          } else if (param == "type") {
            dispatchers = dispatchers.filter(
              (el) => el.type.match(regex) || el.type == req.body.text
            );
          }

          responseData = dispatchers.slice(
            (pageNo - 1) * paginationCount,
            pageNo * paginationCount
          );
          // responseData = dispatchers
          res.status(200).json({
            message: "Success!",
            content: responseData,
            noOfPages: dispatchers / paginationCount,
            noOfRecords: dispatchers.length,
          });
        } else {
          res.status(204).json();
        }
      }
    });
};

exports.createDispatcher = function (req, res) {
  if (req.body.dispatcherType === "Driver") {
    console.log("dispatcherType Driver");
    Driver.findOne({
      _id: req.body.dispatcherId,
      isApproved: true,
      isEnable: true,
    }).exec(function (err, driver) {
      if (err) {
        res.status(500).json({
          message: "Server Error!",
        });
      } else {
        if (driver != null) {
          var dispatcher = new Dispatcher();
          dispatcher.type = "Driver";
          dispatcher.dispatcherId = driver._id;
          dispatcher.dispatchPackageType = req.body.dispatchPackageType;
          dispatcher.isEnable = true;
          dispatcher.commission.dispatcherCommission =
            req.body.dispatcherCommission;
          dispatcher.commission.dispatchAdminCommission =
            req.body.dispatchAdminCommission;
          dispatcher.commission.fromDate = req.body.fromDate;
          dispatcher.commission.toDate = req.body.toDate;
          let salt = bcrypt.hashSync("TaximeDispatcher@#driver", 5);
          dispatcher.dispatcherCode = salt.replace(/[^a-zA-Z ]/g, "");

          dispatcher.save(function (err, results) {
            if (err) {
              res.status(500).send(err);
            } else {
              var newValues2 = {
                $set: {
                  isDispatchEnable: true,
                },
              };

              Driver.findByIdAndUpdate(
                driver._id,
                newValues2,
                function (err, results1) {
                  if (err) {
                    res.status(500).send(err);
                  } else {
                    var wallet = new DispatcherWallet();
                    wallet.dispatcherId = dispatcher.dispatcherId;
                    wallet.dispatcherType = "Driver";
                    wallet.save(function (err, wallet) {
                      if (err) {
                        return res.status(500).send(err);
                      } else {
                        var msg =
                          `Dispatch trips feature enabled \nDispatcher commission: ` +
                          req.body.dispatcherCommission +
                          `%`;

                        DriverPushNotification.sendDispatchEnabledPushNotificationToDriver(
                          req.body.dispatcherId,
                          msg
                        );

                        return res.status(200).json({ message: "success!" });
                      }
                    });
                  }
                }
              );
            }
          });
        } else {
          res.status(202).json({
            message: "Driver is not Approved or Enabled",
          });
        }
      }
    });
  } else if (req.body.dispatcherType === "User") {
    console.log("in 2");
    User.findOne({
      _id: req.body.dispatcherId,
      isEnable: true,
    }).exec(function (err, user) {
      if (err) {
        console.log("2.1");
        res.status(500).send(err);
      } else {
        if (user != null) {
          console.log("2.2");
          var dispatcher = new Dispatcher();
          dispatcher.type = "User";
          dispatcher.dispatcherId = user._id;
          dispatcher.dispatchPackageType = req.body.dispatchPackageType;
          dispatcher.isEnable = true;
          dispatcher.commission.dispatcherCommission =
            req.body.dispatcherCommission;
          dispatcher.commission.dispatchAdminCommission =
            req.body.dispatchAdminCommission;
          dispatcher.commission.fromDate = req.body.fromDate;
          dispatcher.commission.toDate = req.body.toDate;
          let salt = bcrypt.hashSync("TaximeDispatcher@#user", 5);
          dispatcher.dispatcherCode = salt.replace(/[^a-zA-Z ]/g, "");

          dispatcher.save(function (err) {
            if (err) {
              res.status(500).send(err);
            } else {
              var newValues2 = {
                $set: {
                  isDispatchEnable: true,
                },
              };

              User.findByIdAndUpdate(
                user._id,
                newValues2,
                function (err, results2) {
                  if (err) {
                    res.status(500).send(err);
                  } else {
                    var wallet = new DispatcherWallet();
                    wallet.dispatcherId = dispatcher.dispatcherId;
                    wallet.dispatcherType = "User";
                    wallet.save(function (err, wallet) {
                      if (err) {
                        return res.status(500).send(err);
                      } else {
                        /* notify to passenger */
                        //passengerSocket.sendDispatchEnableToPassenger(passengerSocketObj);

                        var msg =
                          `Dispatch trips feature enabled \nDispatcher commission: ` +
                          req.body.dispatcherCommission +
                          `%`;

                        PassengerPushNotification.sendDispatchEnabledPushNotificationToPassenger(
                          req.body.dispatcherId,
                          msg
                        );

                        return res.status(200).json({ message: "success!" });
                      }
                    });
                  }
                }
              );
            }
          });
        } else {
          console.log("2.3");
          res.status(400).json({
            message: "User is not Enabled",
          });
        }
      }
    });
  } else {
    console.log("in 3");
    res.status(500).json({
      message: "Dispatcher type is incorrect",
    });
  }
};

exports.createUserDispatcher = function (req, res) {
  if (req.body.dispatcherType === "User") {
    console.log("in 2");
    User.findOne({
      _id: req.body.dispatcherId,
      isEnable: true,
    }).exec(function (err, user) {
      if (err) {
        console.log("2.1");
        res.status(500).send(err);
      } else {
        if (user != null) {
          console.log("2.2");
          const dispatcher = new Dispatcher();
          dispatcher.type = "User";
          dispatcher.dispatcherId = user._id;
          dispatcher.dispatchPackageType = req.body.dispatchPackageType;
          dispatcher.isEnable = true;
          dispatcher.commission.dispatcherCommission =
            req.body.dispatcherCommission;
          dispatcher.commission.dispatchAdminCommission =
            req.body.dispatchAdminCommission;
          dispatcher.commission.fromDate = req.body.fromDate;
          dispatcher.commission.toDate = req.body.toDate;
          let salt = bcrypt.hashSync("TaximeDispatcher@#user", 5);
          dispatcher.dispatcherCode = salt.replace(/[^a-zA-Z ]/g, "");

          dispatcher.save(function (err) {
            if (err) {
              res.status(500).send(err);
            } else {
              var newValues2 = {
                $set: {
                  isDispatchEnable: true,
                },
              };

              User.findByIdAndUpdate(
                user._id,
                newValues2,
                function (err, results2) {
                  if (err) {
                    res.status(500).send(err);
                  } else {
                    var wallet = new DispatcherWallet();
                    wallet.dispatcherId = dispatcher.dispatcherId;
                    wallet.dispatcherType = "User";
                    wallet.save(function (err, wallet) {
                      if (err) {
                        return res.status(500).send(err);
                      } else {
                        /* notify to passenger */
                        //passengerSocket.sendDispatchEnableToPassenger(passengerSocketObj);

                        var msg =
                          `Dispatch trips feature enabled \nDispatcher commission: ` +
                          req.body.dispatcherCommission +
                          `%`;

                        PassengerPushNotification.sendDispatchEnabledPushNotificationToPassenger(
                          req.body.dispatcherId,
                          msg
                        );

                        return res.status(200).json({ message: "success!" });
                      }
                    });
                  }
                }
              );
            }
          });
        } else {
          console.log("2.3");
          res.status(400).json({
            message: "User is not Enabled",
          });
        }
      }
    });
  } else {
    console.log("in 3");
    res.status(500).json({
      message: "Dispatcher type is incorrect",
    });
  }
};

exports.changeDispatcherStatus = function (req, res) {
  var newValues = {
    $set: {
      isEnable: req.body.isEnable,
    },
  };

  var newValues2 = {
    $set: {
      isDispatchEnable: req.body.isEnable,
    },
  };

  Dispatcher.findByIdAndUpdate(req.body.id, newValues, function (err, results) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (results != null) {
        console.log(results);
        if (results.type == "Driver") {
          Driver.findByIdAndUpdate(
            results.dispatcherId,
            newValues2,
            function (err, results1) {
              if (err) {
                res.status(500).send(err);
              } else {
                var msg =
                  `Dispatch trips feature ` + req.body.isEnable
                    ? "enabled"
                    : "disabled";
                DriverPushNotification.sendDispatchEnabledPushNotificationToDriver(
                  req.body.id,
                  msg
                );

                res.status(200).json({
                  message: "Update Success!",
                });
              }
            }
          );
        } else {
          User.findByIdAndUpdate(
            results.dispatcherId,
            newValues2,
            function (err, results2) {
              if (err) {
                res.status(500).send(err);
              } else {
                var msg =
                  `Dispatch trips feature ` + req.body.isEnable
                    ? "enabled"
                    : "disabled";
                PassengerPushNotification.sendDispatchEnabledPushNotificationToPassenger(
                  req.body.id,
                  msg
                );

                res.status(200).json({
                  message: "Update Success!",
                });
              }
            }
          );
        }
      } else {
        res.status(400).json({
          message: "No dispatcher to update",
        });
      }
    }
  });
};

exports.updateDispatcher = function (req, res) {
  console.log(req.body);
  if (
    req.body.dispatchPackageType !=
    "commission" /*|| req.body.dispatchPackageType != 'subscription'*/
  ) {
    res.status(500).json({
      message: "wrong dispatchPackageType",
    });
  } else {
    var newValues = {
      $set: {
        dispatchPackageType: req.body.dispatchPackageType,
        "commission.dispatcherCommission": req.body.dispatcherCommission,
        "commission.dispatchAdminCommission": req.body.dispatchAdminCommission,
        "commission.fromDate": req.body.fromDate,
        "commission.toDate": req.body.toDate,
      },
    };

    Dispatcher.findByIdAndUpdate(
      req.body.id,
      newValues,
      function (err, results) {
        if (err) {
          res.status(500).send(err);
        } else {
          // console.log(results)
          if (results != null) {
            res.status(200).json({
              message: "update success!",
            });
          } else {
            res.status(204).json();
          }
        }
      }
    );
  }
};

exports.changeCode = function (req, res) {
  var newValues = {
    $set: {
      dispatcherCode: req.body.code,
    },
  };

  Dispatcher.findByIdAndUpdate(
    req.body.dispatcherId,
    newValues,
    function (err, results) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json({
          message: "update success!",
        });
      }
    }
  );
};
