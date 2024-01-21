"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
// var config = require("../config");
// var UserController = require("../controllers/user");
// var jwt = require("jsonwebtoken");
// var bcrypt = require("bcryptjs");
// var cryptoHandler = "../controllers/cryptoHandler";
// var sendSms = require("../services/sendSms");
// var otp = require("../services/randomnum");
// var imageUpload = require("./imageUpload");
var money = require("walletjs");

require("dotenv").config();

var VehicleCategory = require("../models/vehiclecategory");
var RoadPickupTrip = require("../models/roadPickupTrip");
var RoadPickupEmail = require("../emailTemplate/endRoadPickUp");
var ManualCustomer = require("../models/manualcustomer");
var WalletUpdate = require("../services/walletUpdate");

var sendSms = require("../services/sendSms");

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
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

exports.user = function (req, res) {
  console.log("###### user ######");
  res.json({
    status: "user",
  });
};

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

exports.startRoadPickupTrip2 = function (req, res) {
  console.log(req);
  if (req.body.pickupLocation) {
    var roadPickupTrip = new RoadPickupTrip();
    roadPickupTrip.firstName = req.body.firstName;
    roadPickupTrip.lastName = req.body.lastName;
    roadPickupTrip.email = req.body.email;
    roadPickupTrip.mobile = req.body.mobile;

    if (req.body.pickupLocation.address != null) {
      roadPickupTrip.pickupLocation.address = req.body.pickupLocation.address;
      roadPickupTrip.pickupLocation.latitude = req.body.pickupLocation.latitude;
      roadPickupTrip.pickupLocation.longitude =
        req.body.pickupLocation.longitude;
    }

    roadPickupTrip.driverId = req.body.driverId;
    roadPickupTrip.vehicleId = req.body.vehicleId;

    roadPickupTrip.vehicleCategory = req.body.vehicleCategory;
    roadPickupTrip.vehicleSubCategory = req.body.vehicleSubCategory;
    roadPickupTrip.status = "ongoing";

    roadPickupTrip.save(async function (err, data) {
      if (err) {
        console.log(
          "#################### error occured #######################"
        );
        console.log(err);
        res.status(500).send(err);
      } else {
        VehicleCategory.find({
          isEnable: true,
          categoryName: req.body.vehicleCategory,
        }).exec(function (err, category) {
          if (err) {
            console.log("####### error occured" + err);
            res.status(500).send(err);
          } else {
            if (category == null || category.length == 0) {
              res.status(400).json({
                message: "failed",
                details: "Not found category",
                status: "failed",
              });
            } else {
              //console.log(category);

              var timeNow = new Date();
              console.log("###### time #### ", timeNow);

              var minsNow =
                parseInt(timeNow.getHours()) * 60 +
                parseInt(timeNow.getMinutes()) +
                330;
              minsNow = minsNow % 1440;
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
                    res.status(500).send(err1);
                  }
                  // var district = resp[0].administrativeLevels.level2long;

                  var district;

                  if (resp == null) {
                    var responseData = [];
                    console.log("#### category[0] ####");
                    console.log(category[0]);
                    var subCatData = category[0].subCategory.find(
                      (el) => el.subCategoryName == req.body.vehicleSubCategory
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
                      temp = subCatData.roadPickupPriceSelection.find(
                        (el) => el.districtName == "Colombo"
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
                      } else {
                        console.log("This district has no this service");
                        res.status(206).json({
                          message: "District is not available",
                        });
                      }

                      // });
                      // });
                      if (req.body.mobile) {
                        sendSms.sendMsg(
                          req.body.mobile,
                          "A Wonderful Day! Thank you for sharing your mobile number. Your trip has been started. Safe Journey."
                        );
                      }
                      res.json({
                        message: "success",
                        details: "start trip Successfully",
                        content: responseData,
                        tripId: data._id,
                      });
                    }
                  } else {
                    //district = resp[0].administrativeLevels.level2long;
                    district = "Colombo";
                    var responseData = [];
                    console.log("#### category[0] ####");
                    console.log(category[0]);
                    var subCatData = category[0].subCategory.find(
                      (el) => el.subCategoryName == req.body.vehicleSubCategory
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
                      temp = subCatData.roadPickupPriceSelection.find(
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
                      } else {
                        console.log("This district has no this service");
                        res.status(206).json({
                          message: "District is not available",
                        });
                      }

                      // });
                      // });
                      if (req.body.mobile) {
                        sendSms.sendMsg(
                          req.body.mobile,
                          "A Wonderful Day! Thank you for sharing your mobile number. Your trip has been started. Safe Journey."
                        );
                      }
                      res.json({
                        message: "success",
                        details: "start trip Successfully",
                        content: responseData,
                        tripId: data._id,
                      });
                    }
                  }
                }
              );
            }
          }
        });
      }
    });
  } else {
    res.status(500).json({
      message: "failed",
      details: "missing some data data",
      status: "failed",
    });
  }
};

exports.startRoadPickupTrip = function (req, res) {
  if (req.body.pickupLocation.latitude && req.body.pickupLocation.longitude) {
    VehicleCategory.find({
      isEnable: true,
      categoryName: req.body.vehicleCategory,
    }).exec(function (err, category) {
      if (err) {
        console.log("####### error occured" + err);
        res.status(500).send(err);
      } else {
        if (category == null || category.length == 0) {
          res.status(400).json({
            message: "failed",
            details: "Not found category",
            status: "failed",
          });
        } else {
          //console.log(category);

          var timeNow = new Date();
          console.log("###### time #### ", timeNow);

          var minsNow =
            parseInt(timeNow.getHours()) * 60 +
            parseInt(timeNow.getMinutes()) +
            330;
          minsNow = minsNow % 1440;
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
              if (err1) {
                console.log("error in geocode");
                //res.status(500).send(err1);
              }
              // else {

              //     if (resp == null) {
              //         console.log('This district has no this service');
              //         res.status(206).json({
              //             message: 'District is not available'
              //         });
              //    } else {
              // var district = resp[0].administrativeLevels.level2long;
              var district = "Colombo";

              if (!district) {
                district = "Colombo";
              }

              // if (district == null) {
              //     res.status(206).json({
              //         message: 'Can not find district'
              //     });

              //} else {
              var responseData = [];
              console.log("#### category[0] ####");
              console.log(category[0]);
              var subCatData = category[0].subCategory.find(
                (el) => el.subCategoryName == req.body.vehicleSubCategory
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
                temp = subCatData.roadPickupPriceSelection.find(
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

                  var roadPickupTrip = new RoadPickupTrip();
                  roadPickupTrip.firstName = req.body.firstName;
                  roadPickupTrip.lastName = req.body.lastName;
                  roadPickupTrip.email = req.body.email;
                  roadPickupTrip.mobile = req.body.mobile;
                  if (req.body.pickupLocation.address != null) {
                    roadPickupTrip.pickupLocation.address =
                      req.body.pickupLocation.address;
                    roadPickupTrip.pickupLocation.latitude =
                      req.body.pickupLocation.latitude;
                    roadPickupTrip.pickupLocation.longitude =
                      req.body.pickupLocation.longitude;
                  }
                  roadPickupTrip.pickupLocation.latitude =
                    req.body.pickupLocation.latitude;
                  roadPickupTrip.pickupLocation.longitude =
                    req.body.pickupLocation.longitude;

                  roadPickupTrip.driverId = req.body.driverId;
                  roadPickupTrip.vehicleId = req.body.vehicleId;

                  roadPickupTrip.vehicleCategory = req.body.vehicleCategory;
                  roadPickupTrip.vehicleSubCategory =
                    req.body.vehicleSubCategory;
                  roadPickupTrip.status = "ongoing";

                  roadPickupTrip.save(async function (error1, data) {
                    if (error1) {
                      console.log(
                        "#################### error occured #######################"
                      );
                      console.log(error1);
                      res.status(500).send(error1);
                    } else {
                      if (req.body.mobile) {
                        sendSms.sendMsg(
                          req.body.mobile,
                          "A Wonderful Day! Thank you for sharing your mobile number. Your trip has been started. Safe Journey."
                        );
                      }

                      ManualCustomer.findOne(
                        {
                          mobile: req.body.mobile,
                        },
                        function (error3, data) {
                          if (error3) {
                            console.log("error in manual customer");
                          } else {
                            if (data != null) {
                              console.log("manual customer not null");
                            } else {
                              var manualcustomer = new ManualCustomer();
                              manualcustomer.firstName = req.body.firstName;
                              manualcustomer.lastName = req.body.lastName;
                              manualcustomer.email = req.body.email;
                              manualcustomer.mobile = req.body.mobile;

                              manualcustomer.save(async function (
                                err,
                                data
                              ) {});
                            }
                          }
                        }
                      );

                      res.json({
                        message: "success",
                        details: "start trip Successfully",
                        content: responseData,
                        tripId: data._id,
                      });
                    }
                  });
                } else {
                  console.log("This district has no this service");
                  res.status(206).json({
                    message: "District is not available",
                  });
                }
              }
              //}

              // }
            }
          );
        }
      }
    });
  } else {
    res.status(500).json({
      message: "failed",
      details: "missing some data data",
      status: "failed",
    });
  }
};

exports.endRoadPickupTrip1 = function (req, res) {
  var cost = Math.round(req.body.totalCost);
  let newValues = {
    $set: {
      distance: req.body.distance,
      totalCost: cost,
      waitTime: req.body.waitTime,
      waitingCost: req.body.waitingCost,
      status: "done",
      "dropLocation.address": req.body.dropLocation.address,
      "dropLocation.latitude": req.body.dropLocation.latitude,
      "dropLocation.longitude": req.body.dropLocation.longitude,
    },
  };

  RoadPickupTrip.findByIdAndUpdate(
    req.body.id,
    newValues,
    function (err, results) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: err,
        });
      } else {
        console.log(results);
        if (results.mobile)
          sendSms.sendMsg(
            results.mobile,
            "Your Trip has been completed. Total Fare is Rs. " +
              cost +
              ".00 See you Again."
          );

        if (results.email)
          RoadPickupEmail.roadPickupEndEmail(results.email, cost);
        res.status(200).json({
          message: "successfully  end trip",
        });
      }
    }
  );
};

exports.endRoadPickupTrip = function (req, res) {
  console.log(req.body);
  var cost = money.Money.init(req.body.totalCost);
  if (req.body.adminCommission > 0) {
    var adminCommission = money.Money.init(req.body.adminCommission);
  } else {
    console.log("adminCommission is 0");
    var adminCommission = money.Money.init(10);
  }
  console.log(cost.getValue());

  var adminCpecentage = adminCommission.divideBy(100);
  var adminCost = cost.multiplyBy(adminCpecentage);
  var acost = money.Money.init(adminCost);
  var driverCost = cost.subtract(acost);

  let newValues = {
    $set: {
      distance: req.body.distance,
      totalCost: cost.getValue(),
      waitTime: req.body.waitTime,
      waitingCost: req.body.waitingCost,
      status: "done",
      tripTime: req.body.tripTime,
      "dropLocation.address": req.body.dropLocation.address,
      "dropLocation.latitude": req.body.dropLocation.latitude,
      "dropLocation.longitude": req.body.dropLocation.longitude,
      "pickupLocation.address": req.body.pickupLocation.address,
      "pickupLocation.latitude": req.body.pickupLocation.latitude,
      "pickupLocation.longitude": req.body.pickupLocation.longitude,
    },
  };

  var dropPoint = [
    {
      address: req.body.dropLocation.address,
      latitude: req.body.dropLocation.latitude,
      longitude: req.body.dropLocation.longitude,
    },
  ];

  console.log(adminCost.getValue());
  console.log(driverCost.getValue());

  var tripToDriver = {
    tripId: req.body.id,
    tripEarning: driverCost.getValue(),
    tripAdminCommission: adminCost.getValue(),
    totalTripValue: cost.getValue(),
    pickupLocation: req.body.pickupLocation,
    destinations: dropPoint,
  };

  var tripToAdmin = {
    tripId: req.body.id,
    tripEarning: adminCost.getValue(),
    tripAdminCommission: adminCost.getValue(),
    totalTripValue: cost.getValue(),
    pickupLocation: req.body.pickupLocation,
    destinations: dropPoint,
  };

  var driverTransactionObj = {
    dateTime: new Date(),
    transactionAmount: driverCost.getValue(),
    transactionType: "roadPickup",
    isATrip: true,
    isCredited: true,
    method: "cash",
    trip: tripToDriver,
  };

  var companyTransactionObj = {
    dateTime: new Date(),
    transactionAmount: adminCost.getValue(),
    transactionType: "roadPickup",
    isATrip: true,
    isCredited: true,
    method: "cash",
    trip: tripToAdmin,
  };

  console.log(driverTransactionObj);
  console.log(companyTransactionObj);

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

  RoadPickupTrip.findByIdAndUpdate(
    req.body.id,
    newValues,
    function (err, results) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: err,
        });
      } else {
        console.log(results);
        if (results.mobile)
          sendSms.sendMsg(
            results.mobile,
            "Your Trip has been completed. Total Fare is Rs. " +
              cost.getValue() +
              " See you Again."
          );

        if (results.email)
          RoadPickupEmail.roadPickupEndEmail(results.email, cost.getValue());
        res.status(200).json({
          message: "successfully  end trip",
        });
      }
    }
  );
};

exports.getRoadPickupTrip = function (req, res) {
  console.log(req.params.from);
  console.log(req.params.to);
  var fromDate = new Date(req.params.from);
  var toDate = new Date(req.params.to);
  RoadPickupTrip.aggregate([
    {
      $lookup: {
        from: "drivers",
        localField: "driverId",
        foreignField: "_id",
        as: "driver",
      },
    },
    {
      $lookup: {
        from: "vehicles",
        localField: "vehicleId",
        foreignField: "_id",
        as: "vehicle",
      },
    },
    {
      $match: {
        pickupDateTime: {
          $gte: fromDate,
          $lt: toDate,
        },
      },
    },
    {
      $project: {
        "driver.otpPin": 0,
        "driver.otpTime": 0,
        "driver.saltSecret": 0,
      },
    },
  ]).exec(function (err, data) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send(error);
    } else {
      if (data == null) {
        res.status(400).json({
          message: "failed",
          details: "No data found",
          status: "failed",
        });
      } else {
        res.json({
          message: "success",
          details: "Success",
          content: data,
        });
      }
    }
  });
};

exports.getRoadPickupTrippagination = function (req, res) {
  console.log(req.params.from);
  console.log(req.params.to);
  var fromDate = new Date(req.params.from);
  var toDate = new Date(req.params.to);

  var pageNo = req.params.pageNo;
  var paginationCount = 10;
  var responseData;
  var param = req.params.param;

  RoadPickupTrip.aggregate([
    {
      $lookup: {
        from: "drivers",
        localField: "driverId",
        foreignField: "_id",
        as: "driver",
      },
    },
    {
      $lookup: {
        from: "vehicles",
        localField: "vehicleId",
        foreignField: "_id",
        as: "vehicle",
      },
    },
    {
      $match: {
        $and: [
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
    },
    {
      $project: {
        "driver.otpPin": 0,
        "driver.otpTime": 0,
        "driver.saltSecret": 0,
      },
    },
  ])
    .sort({ recordedTime: -1 })
    .exec(function (err, data) {
      if (err) {
        console.log("####### error occured" + err);
        res.status(400).send(error);
      } else {
        if (data == null) {
          res.status(400).json({
            message: "failed",
            details: "No data found",
            status: "failed",
          });
        } else {
          responseData = data.slice(
            (pageNo - 1) * paginationCount,
            pageNo * paginationCount
          );
          res.json({
            content: responseData,
            noOfPages: data / paginationCount,
            noOfRecords: data.length,
          });
        }
      }
    });
};

// admin get roadPickups by driverId
exports.getRoadPickupDetailsByDriverId = function (req, res) {
  RoadPickupTrip.find({
    driverId: req.body.driverId,
  }).exec(function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (data != null) {
        res.status(200).json({
          message: "success!",
          content: data,
        });
      } else {
        res.status(400).json({
          message: "failed!",
          details: "No RoadPickups for this driver.",
        });
      }
    }
  });
};
