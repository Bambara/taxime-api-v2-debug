"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
// var config = require("../config");
var VehicleCategory = require("../models/vehiclecategory");
// var jwt = require("jsonwebtoken");
// var bcrypt = require("bcryptjs");
// var cryptoHandler = "../controllers/cryptoHandler";
var imageUpload = require("./imageUpload");

require("dotenv").config();

app.use(cors());
router.use(cors());

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

exports.vehicleCategory = function (req, res) {
  console.log("###### vehicleCategory ######");
  res.json({
    status: "vehicleCategory",
  });
};

//############# Category #########################

exports.saveCategoryAllData = function (req, res) {
  console.log(req.body);
  console.log(req.body.categoryObj.subCategory);

  console.log("###### Add new Category ######");
  VehicleCategory.findOne({
    categoryName: req.body.categoryObj.categoryName,
  }).exec(function (err, users) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (users !== null) {
        console.log(
          "####################### not an null data : category already exist ##########################"
        );
        res.status(400).json({
          message: "failed",
          details: "category already registered!",
          status: "failed",
        });
      } else {
        console.log(
          "####################### null data ##########################"
        );
        var vehicleCategory = new VehicleCategory();
        vehicleCategory.categoryName = req.body.categoryObj.categoryName;
        vehicleCategory.description = req.body.categoryObj.description;
        vehicleCategory.categoryNo = req.body.categoryObj.categoryNo;
        vehicleCategory.isEnable = req.body.categoryObj.isEnable;

        for (var i = 0; i < req.body.categoryObj.subCategory.length; i++) {
          var tempSubCat = {
            subCategoryName:
              req.body.categoryObj.subCategory[i].subCategoryName,
            tripSendDriversCount:
              req.body.categoryObj.subCategory[i].tripSendDriversCount,
            higherBidTripChanceCount:
              req.body.categoryObj.subCategory[i].higherBidTripChanceCount,
            subCategorySkippingCount:
              req.body.categoryObj.subCategory[i].subCategorySkippingCount,
            passengerCount: req.body.categoryObj.subCategory[i].passengerCount,
            driverTripTimerSecoends:
              req.body.categoryObj.subCategory[i].driverTripTimerSecoends,
            subCategoryNo: req.body.categoryObj.subCategory[i].subCategoryNo,
            vehicles: [],
            priceSelection: [],
            roadPickupPriceSelection: [],
            subDescription: req.body.categoryObj.subCategory[i].subDescription,
            isEnable: req.body.categoryObj.subCategory[i].subIsEnable,
            packageDelivery:
              req.body.categoryObj.subCategory[i].packageDelivery,
          };

          for (
            var j = 0;
            j < req.body.categoryObj.subCategory[i].vehicles.length;
            j++
          ) {
            var tempVehicle = {
              vehicleBrand:
                req.body.categoryObj.subCategory[i].vehicles[j].vehicleBrand,
              vehicleName:
                req.body.categoryObj.subCategory[i].vehicles[j].vehicleName,
              vehicleClass:
                req.body.categoryObj.subCategory[i].vehicles[j].vehicleClass,
              modelType:
                req.body.categoryObj.subCategory[i].vehicles[j].modelType,
              modelCapacity:
                req.body.categoryObj.subCategory[i].vehicles[j].modelCapacity,
              vehiclePassengerCount:
                req.body.categoryObj.subCategory[i].vehicles[j]
                  .vehiclePassengerCount,
              vehicleCapacityWeightLimit:
                req.body.categoryObj.subCategory[i].vehicles[j]
                  .vehicleCapacityWeightLimit,
              // adminCommission: req.body.categoryObj.subCategory[i].vehicles[j].commission.adminCommission,
              // companyCommission: req.body.categoryObj.subCategory[i].vehicles[j].commission.companyCommission
            };
            tempSubCat.vehicles.push(tempVehicle);
          }

          for (
            var j = 0;
            j < req.body.categoryObj.subCategory[i].priceSelection.length;
            j++
          ) {
            var tempPriceSelection = {
              districtName:
                req.body.categoryObj.subCategory[i].priceSelection[j]
                  .districtName,
              timeBase: [],
            };

            for (
              let k = 0;
              k <
              req.body.categoryObj.subCategory[i].priceSelection[j].timeBase
                .length;
              k++
            ) {
              var tempTimeBase = {
                timeSlotName:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].timeSlotName,
                startingTime:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].startingTime,
                endingTime:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].endingTime,
                districtPrice:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].districtPrice,
                lowerBidLimit:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].lowerBidLimit,
                upperBidLimit:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].upperBidLimit,
                baseFare:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].baseFare,
                minimumFare:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].minimumFare,
                minimumKM:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].minimumKM,
                belowAboveKMRange:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].belowAboveKMRange,
                aboveKMFare:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].aboveKMFare,
                belowKMFare:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].belowKMFare,
                trafficWaitingChargePerMinute:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].trafficWaitingChargePerMinute,
                normalWaitingChargePerMinute:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].normalWaitingChargePerMinute,
                radius:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].radius,
                packageDeliveryKMPerHour:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].packageDeliveryKMPerHour,
                packageDeliveryKMPerDay:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].packageDeliveryKMPerDay,

                tripCancelationFee:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].tripCancelationFee,
                maxWaitingTimeWithoutCharge:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].maxWaitingTimeWithoutCharge,
              };
              tempPriceSelection.timeBase.push(tempTimeBase);
            }
            tempSubCat.priceSelection.push(tempPriceSelection);
          }

          for (
            var j = 0;
            j <
            req.body.categoryObj.subCategory[i].roadPickupPriceSelection.length;
            j++
          ) {
            var temproadPickupPriceSelection = {
              districtName:
                req.body.categoryObj.subCategory[i].roadPickupPriceSelection[j]
                  .districtName,
              timeBase: [],
            };

            for (
              let k = 0;
              k <
              req.body.categoryObj.subCategory[i].roadPickupPriceSelection[j]
                .timeBase.length;
              k++
            ) {
              var tempTimeBase = {
                timeSlotName:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].timeSlotName,
                startingTime:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].startingTime,
                endingTime:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].endingTime,
                districtPrice:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].districtPrice,
                baseFare:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].baseFare,
                minimumFare:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].minimumFare,
                minimumKM:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].minimumKM,
                belowAboveKMRange:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].belowAboveKMRange,
                aboveKMFare:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].aboveKMFare,
                belowKMFare:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].belowKMFare,
                trafficWaitingChargePerMinute:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].trafficWaitingChargePerMinute,
                normalWaitingChargePerMinute:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].normalWaitingChargePerMinute,
                radius:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].radius,
                packageDeliveryKMPerHour:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].packageDeliveryKMPerHour,
                packageDeliveryKMPerDay:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].packageDeliveryKMPerDay,
              };
              temproadPickupPriceSelection.timeBase.push(tempTimeBase);
            }
            tempSubCat.roadPickupPriceSelection.push(
              temproadPickupPriceSelection
            );
          }

          vehicleCategory.subCategory.push(tempSubCat);
        }
        console.log(req.body.categoryObj.subCategory.length);

        //vehicleCategory.subCategory = req.body.categoryObj.subCategory

        vehicleCategory.save(function (err) {
          if (err) {
            console.log(
              "#################### error occured #######################"
            );
            console.log(err);
            res.status(400).send(err);
          } else {
            res.json({
              message: "success",
              details: "Added category Successfully",
              content: vehicleCategory,
            });
          }
        });
      }
    }
  });
};

exports.getCategoryAllData = function (req, res) {
  console.log("###### get Category ######");

  VehicleCategory.find().exec(function (err, category) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (category == null) {
        res.status(400).json({
          message: "failed",
          details: "No data found",
          status: "failed",
        });
      } else {
        res.json({
          message: "success",
          details: "get category data Successfully",
          content: category,
        });
      }
    }
  });
};

/* get enabled categories */
exports.getEnabledCategoryAllData = function (req, res) {
  console.log("###### vehiclecategory : getEnabledCategoryAllData ######");

  VehicleCategory.find({
    isEnable: true,
  }).exec(function (err, category) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (category == null) {
        res.status(400).json({
          message: "failed",
          details: "No data found",
          status: "failed",
        });
      } else {
        res.json({
          message: "success",
          details: "get category data Successfully",
          content: category,
        });
      }
    }
  });
};

exports.getCategoryAllDataTimeAndLocationBased = function (req, res) {
  console.log(
    "####################### getCategoryAllDataTimeAndLocationBased #######################"
  );

  VehicleCategory.find({
    isEnable: true,
  }).exec(async function (err, category) {
    if (err) {
      console.log(
        "####### getCategoryAllDataTimeAndLocationBased error occured" + err
      );
      res.status(400).send("error");
    } else {
      if (category == null) {
        console.log(
          "####### getCategoryAllDataTimeAndLocationBased : category null #######"
        );
        res.status(400).json({
          message: "null",
          details: "No data found",
          status: "failed",
        });
      } else {
        if (req.body.date != null && req.body.time != null) {
          console.log("####### getCategoryAllDataTimeAndLocationBased : got send time #######");
          var date = req.body.date + "T" + req.body.time + ".000Z";
          var timeNow = new Date(date);
          console.log("###### time #### ", timeNow);
          var mins =
            parseInt(timeNow.getHours()) * 60 + parseInt(timeNow.getMinutes());
          console.log(
            "###### time #### ",
            timeNow.getHours(),
            " : ",
            timeNow.getMinutes() + " => " + mins
          );
        } else {
          var timeNow = new Date();
          console.log("###### time #### ", timeNow);

          var mins =
            parseInt(timeNow.getHours()) * 60 +
            parseInt(timeNow.getMinutes()) +
            330;
          mins = mins % 1140;
          console.log(
            "###### time #### ",
            timeNow.getHours(),
            " : ",
            timeNow.getMinutes() + " => " + mins
          );
        }

        let resp = await geocoder.reverse({
          lat: req.body.latitude,
          lon: req.body.longitude,
        });

        if (resp) {
          console.log("****** district ****** ", resp);
          var district = resp[0].administrativeLevels.level2long;

          if (!district) {
            district = "Colombo";
          }

          var responseData = [];

          // sort category
          category.sort((el1, el2) => {
            if (el1.categoryNo < el2.categoryNo) return -1;
            if (el1.categoryNo > el2.categoryNo) return 1;
          });

          category.forEach((element) => {
            // sort sub category
            element.subCategory.sort((el1, el2) => {
              if (el1.subCategoryNo < el2.subCategoryNo) return -1;
              if (el1.subCategoryNo > el2.subCategoryNo) return 1;
            });
            element.subCategory.forEach((element1) => {
              let temp = element1.priceSelection.find(
                (el) => el.districtName == district
              );
              //console.log('####### printing priceSelection temp######')
              //console.log(temp)
              //var defaultTimeBase = temp.timeBase[0];

              if (temp) {
                var timeBaseSelected = {};

                temp.timeBase.forEach((element2) => {
                  //console.log("########### print timebase category  ##########");
                  //console.log(element2);

                  var start =
                    parseInt(element2.startingTime.split(":")[0]) * 60 +
                    parseInt(element2.startingTime.split(":")[1]);
                  var end =
                    parseInt(element2.endingTime.split(":")[0]) * 60 +
                    parseInt(element2.endingTime.split(":")[1]);

                  //console.log(start + '------' + end)
                  //console.log(element2);

                  if (start < end) {
                    if (mins >= start && mins <= end) {
                      //console.log('O');
                      element1.lowerBidLimit = element2.lowerBidLimit;
                      element1.upperBidLimit = element2.upperBidLimit;
                      element1.roadPickupPriceSelection = [];
                      element1.priceSelection = element1.priceSelection.filter(
                        (el) => el.districtName == district
                      );
                      element1.priceSelection[0].timeBase = [];
                      element1.priceSelection[0].timeBase.push(element2);
                    }
                  } else {
                    //console.log('N');

                    if (mins >= start && mins >= end) {
                      element1.lowerBidLimit = element2.lowerBidLimit;
                      element1.upperBidLimit = element2.upperBidLimit;
                      element1.roadPickupPriceSelection = [];
                      element1.priceSelection = element1.priceSelection.filter(
                        (el) => el.districtName == district
                      );
                      element1.priceSelection[0].timeBase = [];
                      element1.priceSelection[0].timeBase.push(element2);
                    }
                  }
                  //console.log('### printing element2 ##########')
                  //console.log(element2);
                });
              }
              //console.log('### printing element1')
              //console.log(element1);
              element1.categoryTag = element.categoryName;
              //element1.priceSelection = [];
              responseData.push(element1);
            });
          });

          res.json({
            message: "success",
            details: "get category data Successfully",
            content: responseData,
          });
        }

        // geocoder.reverse({lat:req.body.latitude, lon:req.body.longitude}, function(err, resp) {
        // // geocoder.geocode(req.body.address, function (err, resp) {

        //   console.log('****** district ****** ', resp);
        //   var district = resp[0].administrativeLevels.level2long;
        //   //var district = 'Colombo';

        //   if(!district){
        //     district = 'Colombo';
        //   }

        //   var responseData = [];

        //   // sort category
        //   category.sort((el1, el2) => {

        //     if (el1.categoryNo < el2.categoryNo)
        //       return -1;
        //     if (el1.categoryNo > el2.categoryNo)
        //       return 1;

        //   });

        //   category.forEach(element => {

        //     // sort sub category
        //     element.subCategory.sort((el1, el2) => {

        //       if (el1.subCategoryNo < el2.subCategoryNo)
        //         return -1;
        //       if (el1.subCategoryNo > el2.subCategoryNo)
        //         return 1;

        //     });
        //     element.subCategory.forEach(element1 => {

        //       let temp = element1.priceSelection.find(el => el.districtName == district)
        //       //console.log('####### printing temp######')
        //       //console.log(temp)
        //       //var defaultTimeBase = temp.timeBase[0];

        //       if (temp) {
        //         var timeBaseSelected = {}

        //         temp.timeBase.forEach(element2 => {

        //           var start = parseInt(element2.startingTime.split(':')[0]) * 60 + parseInt(element2.startingTime.split(':')[1])
        //           var end = parseInt(element2.endingTime.split(':')[0]) * 60 + parseInt(element2.endingTime.split(':')[1])

        //          //console.log(start + '------' + end)
        //           //console.log(element2);

        //           if (start < end) {

        //             if (mins >= start && mins <= end) {
        //               //console.log('O');
        //               element1.lowerBidLimit = element2.lowerBidLimit
        //               element1.upperBidLimit = element2.upperBidLimit
        //               element1.roadPickupPriceSelection = [];
        //               element1.priceSelection = element1.priceSelection.filter(el => el.districtName == district);
        //               element1.priceSelection[0].timeBase = [];
        //               element1.priceSelection[0].timeBase.push(element2);
        //             }
        //           } else {
        //             //console.log('N');

        //             if (mins >= start && mins >= end) {
        //               element1.lowerBidLimit = element2.lowerBidLimit
        //               element1.upperBidLimit = element2.upperBidLimit
        //               element1.roadPickupPriceSelection = [];
        //               element1.priceSelection = element1.priceSelection.filter(el => el.districtName == district);
        //               element1.priceSelection[0].timeBase = [];
        //               element1.priceSelection[0].timeBase.push(element2);
        //             }
        //           }
        //           console.log('### printing element2 ##########')
        //           //console.log(element2);

        //         });
        //       }
        //       //console.log('### printing element1')
        //       //console.log(element1);
        //       element1.categoryTag = element.categoryName
        //       //element1.priceSelection = [];
        //       responseData.push(element1);
        //     });
        //   });

        //   // responseData.sort((el1, el2) => {

        //   //   if (el1.lowerBidLimit < el2.lowerBidLimit)
        //   //     return -1;
        //   //   if (el1.lowerBidLimit > el2.lowerBidLimit)
        //   //     return 1;

        //   // });

        //   res.json({
        //     message: 'success',
        //     details: "get category data Successfully",
        //     content: responseData
        //   });
        // });
      }
    }
  });
};

exports.updateCategoryData = function (req, res) {
  console.log(
    "#################### updateCategoryData #######################"
  );
  console.log(req.body);

  VehicleCategory.findOne({
    _id: req.body.id,
  }).exec(function (err, users) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (users == null) {
        res.status(400).json({
          message: "failed",
          details: "category not exists",
          status: "failed",
        });
      } else {
        VehicleCategory.findOneAndUpdate(
          {
            _id: req.body.id,
          },
          {
            $set: {
              categoryName: req.body.categoryName,
              description: req.body.description,
              isEnable: req.body.isEnable,
              categoryNo: req.body.categoryNo,
            },
          },
          function (err) {
            if (err) {
              console.log(
                "#################### error occured #######################"
              );
              console.log(err);
              res.status(400).send(err);
            } else {
              res.json({
                message: "success",
                details: "Update category Successfully",
              });
            }
          }
        );
      }
    }
  });
};

exports.deleteCategoryAllData = function (req, res) {
  console.log(req.body);

  VehicleCategory.findOne({
    categoryName: req.body.categoryName,
  }).exec(function (err, users) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (users == null) {
        res.status(400).json({
          message: "failed",
          details: "category not exists",
          status: "failed",
        });
      } else {
        VehicleCategory.remove(
          {
            categoryName: req.body.categoryName,
          },
          function (err) {
            if (err) {
              console.log(
                "#################### error occured #######################"
              );
              console.log(err);
              res.status(400).send(err);
            } else {
              res.json({
                message: "success",
                details:
                  "Delete " + req.body.categoryName + " category Successfully",
              });
            }
          }
        );
      }
    }
  });
};

//############## Upload Images ###################
exports.categoryImageUpload = function (req, res) {
  console.log("###### category image upload #######");
  //res.json({status: 'sign In'});
  VehicleCategory.findOne({
    _id: mongoose.Types.ObjectId(req.body.CategoryId),
  }).exec(function (err, data) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send(err);
    } else {
      if (data !== null) {
        console.log(
          "####################### not an null data : data already exist ##########################"
        );

        imageUpload.uploadImagesInSubDocuments(
          req.files,
          req.body.CategoryId,
          req.body.subCategoryId,
          VehicleCategory,
          "vehicleCategory"
        );

        res.status(200).json({
          message: "success",
        });
      } else {
        console.log(
          "####################### null data ##########################"
        );
        res.status(400).send({
          message: "failed",
          details: "data not registered! Please Signup",
          status: "signup_failed",
        });
      }
    }
  });
};

//############# sub Category #########################

exports.addSubCategory = function (req, res) {
  console.log(req.body);
  console.log(req.body.categoryObj.subCategory);

  VehicleCategory.findOne({
    categoryName: req.body.categoryObj.categoryName,
  }).exec(function (err, data) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (data == null) {
        res.status(400).json({
          message: "failed",
          details: "category not registered!",
          status: "failed",
        });
      } else {
        var vehicleCategory = new VehicleCategory();
        vehicleCategory.categoryName = req.body.categoryObj.categoryName;
        vehicleCategory.description = req.body.categoryObj.description;
        vehicleCategory.isEnable = req.body.categoryObj.isEnable;

        for (var i = 0; i < req.body.categoryObj.subCategory.length; i++) {
          var tempSubCat = {
            subCategoryName:
              req.body.categoryObj.subCategory[i].subCategoryName,
            subCategoryNo: req.body.categoryObj.subCategory[i].subCategoryNo,
            tripSendDriversCount:
              req.body.categoryObj.subCategory[i].tripSendDriversCount,
            higherBidTripChanceCount:
              req.body.categoryObj.subCategory[i].higherBidTripChanceCount,
            subCategorySkippingCount:
              req.body.categoryObj.subCategory[i].subCategorySkippingCount,
            passengerCount: req.body.categoryObj.subCategory[i].passengerCount,
            driverTripTimerSecoends:
              req.body.categoryObj.subCategory[i].driverTripTimerSecoends,
            priceSelection: [],
            roadPickupPriceSelection: [],
            subDescription: req.body.categoryObj.subCategory[i].subDescription,
            isEnable: req.body.categoryObj.subCategory[i].subIsEnable,
            packageDelivery:
              req.body.categoryObj.subCategory[i].packageDelivery,
          };

          for (
            var j = 0;
            j < req.body.categoryObj.subCategory[i].vehicles.length;
            j++
          ) {
            var tempVehicle = {
              vehicleBrand:
                req.body.categoryObj.subCategory[i].vehicles[j].vehicleBrand,
              vehicleName:
                req.body.categoryObj.subCategory[i].vehicles[j].vehicleName,
              vehicleClass:
                req.body.categoryObj.subCategory[i].vehicles[j].vehicleClass,
              modelType:
                req.body.categoryObj.subCategory[i].vehicles[j].modelType,
              modelCapacity:
                req.body.categoryObj.subCategory[i].vehicles[j].modelCapacity,
              vehiclePassengerCount:
                req.body.categoryObj.subCategory[i].vehicles[j]
                  .vehiclePassengerCount,
              vehicleCapacityWeightLimit:
                req.body.categoryObj.subCategory[i].vehicles[j]
                  .vehicleCapacityWeightLimit,
              adminCommission:
                req.body.categoryObj.subCategory[i].vehicles[j].commission
                  .adminCommission,
              companyCommission:
                req.body.categoryObj.subCategory[i].vehicles[j].commission
                  .companyCommission,
            };
            tempSubCat.vehicles.push(tempVehicle);
          }

          for (
            var j = 0;
            j < req.body.categoryObj.subCategory[i].priceSelection.length;
            j++
          ) {
            var tempPriceSelection = {
              districtName:
                req.body.categoryObj.subCategory[i].priceSelection[j]
                  .districtName,
              timeBase: [],
            };

            for (
              let k = 0;
              k <
              req.body.categoryObj.subCategory[i].priceSelection[j].timeBase
                .length;
              k++
            ) {
              var tempTimeBase = {
                startingTime:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].startingTime,
                endingTime:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].endingTime,
                districtPrice:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].districtPrice,
                baseFare:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].baseFare,
                minimumFare:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].minimumFare,
                minimumKM:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].minimumKM,
                belowAboveKMRange:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].belowAboveKMRange,
                aboveKMFare:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].aboveKMFare,
                belowKMFare:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].belowKMFare,
                trafficWaitingChargePerMinute:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].trafficWaitingChargePerMinute,
                normalWaitingChargePerMinute:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].normalWaitingChargePerMinute,
                radius:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].radius,
                packageDeliveryKMPerHour:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].packageDeliveryKMPerHour,
                packageDeliveryKMPerDay:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].packageDeliveryKMPerDay,

                tripCancelationFee:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].tripCancelationFee,
                maxWaitingTimeWithoutCharge:
                  req.body.categoryObj.subCategory[i].priceSelection[j]
                    .timeBase[k].maxWaitingTimeWithoutCharge,
              };
              tempPriceSelection.timeBase.push(tempTimeBase);
            }
            tempSubCat.priceSelection.push(tempPriceSelection);
          }

          for (
            var j = 0;
            j <
            req.body.categoryObj.subCategory[i].roadPickupPriceSelection.length;
            j++
          ) {
            var temproadPickupPriceSelection = {
              districtName:
                req.body.categoryObj.subCategory[i].roadPickupPriceSelection[j]
                  .districtName,
              timeBase: [],
            };

            for (
              let k = 0;
              k <
              req.body.categoryObj.subCategory[i].roadPickupPriceSelection[j]
                .timeBase.length;
              k++
            ) {
              var tempTimeBase = {
                timeSlotName:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].timeSlotName,
                startingTime:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].startingTime,
                endingTime:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].endingTime,
                districtPrice:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].districtPrice,
                baseFare:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].baseFare,
                minimumFare:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].minimumFare,
                minimumKM:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].minimumKM,
                belowAboveKMRange:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].belowAboveKMRange,
                aboveKMFare:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].aboveKMFare,
                belowKMFare:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].belowKMFare,
                trafficWaitingChargePerMinute:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].trafficWaitingChargePerMinute,
                normalWaitingChargePerMinute:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].normalWaitingChargePerMinute,
                radius:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].radius,
                packageDeliveryKMPerHour:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].packageDeliveryKMPerHour,
                packageDeliveryKMPerDay:
                  req.body.categoryObj.subCategory[i].roadPickupPriceSelection[
                    j
                  ].timeBase[k].packageDeliveryKMPerDay,
              };
              temproadPickupPriceSelection.timeBase.push(tempTimeBase);
            }
            tempSubCat.roadPickupPriceSelection.push(
              temproadPickupPriceSelection
            );
          }

          vehicleCategory.subCategory.push(tempSubCat);
        }
        console.log(req.body.categoryObj.subCategory[0]);

        //vehicleCategory.subCategory = req.body.categoryObj.subCategory

        VehicleCategory.update(
          {
            categoryName: req.body.categoryObj.categoryName,
          },
          {
            $push: {
              // subCategory : { 'subCategoryName' :  req.body.categoryObj.subCategory[0].subCategoryName,
              //                 'subDescription' :  req.body.categoryObj.subCategory[0].subDescription
              // }
              subCategory: req.body.categoryObj.subCategory[0],
            },
          },
          function (err) {
            if (err) {
              console.log(
                "#################### error occured #######################"
              );
              console.log(err);
              res.status(400).send(err);
            } else {
              res.json({
                message: "success",
                details: "Added sub category Successfully",
                content: vehicleCategory,
              });
            }
          }
        );
      }
    }
  });
};

exports.deleteSubCategory = function (req, res) {
  console.log(req.body);

  VehicleCategory.findOne({
    categoryName: req.body.categoryName,
    "subCategory.subCategoryName": req.body.subCategoryName,
  }).exec(function (err, users) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (users == null) {
        res.status(400).json({
          message: "failed",
          details: "sub category not exists",
          status: "failed",
        });
      } else {
        VehicleCategory.update(
          {
            categoryName: req.body.categoryName,
          },
          {
            $pull: {
              subCategory: {
                subCategoryName: req.body.subCategoryName,
              },
            },
          },
          function (err) {
            if (err) {
              console.log(
                "#################### error occured #######################"
              );
              console.log(err);
              res.status(400).send(err);
            } else {
              res.json({
                message: "success",
                details:
                  "Delete Category :" +
                  req.body.categoryName +
                  " => Sub Category : " +
                  req.body.subCategoryName +
                  " Successfully",
              });
            }
          }
        );
      }
    }
  });
};

exports.updateSubCategory = function (req, res) {
  console.log("###### vehicle Category update sub category ######");

  var subCategoryUpdateObj = req.body.subCategoryUpdateObj;

  VehicleCategory.findOne({
    categoryName: subCategoryUpdateObj.categoryName,
  }).exec(function (err, catVal) {
    if (err) {
      console.log("error occured");
    } else {
      if (catVal == null) {
        res.json({
          message: "failed",
          details: "this category name is not defined  !",
          status: "update_failed",
        });
      } else {
        var editID = catVal._id;

        var checkBool = false;

        for (var i = 0; i < catVal.subCategory.length; i++) {
          console.error(catVal.subCategory[i]._id);
          console.error(subCategoryUpdateObj.subCategory.subId);

          if (
            catVal.subCategory[i]._id == subCategoryUpdateObj.subCategory.subId
          ) {
            //check the sub category name already exit
            checkBool = true;
            var SubID = i;

            var subCategoryIconNew = catVal.subCategory[SubID].subCategoryIcon;
            var subCategoryIconSelectedNew =
              catVal.subCategory[SubID].subCategoryIconSelected;
            var mapIconNew = catVal.subCategory[SubID].mapIcon;
            var mapIconOffline = catVal.subCategory[SubID].mapIconOffline;
            var mapIconOntrip = catVal.subCategory[SubID].mapIconOntrip;
            var subCategoryNameNew = catVal.subCategory[SubID].subCategoryName;
            var tripSendDriversCount =
              catVal.subCategory[SubID].tripSendDriversCount;
            var subCategoryNo = catVal.subCategory[SubID].subCategoryNo;
            var higherBidTripChanceCount =
              catVal.subCategory[SubID].higherBidTripChanceCount;
            var subCategorySkippingCount =
              catVal.subCategory[SubID].subCategorySkippingCount;
            var passengerCount = catVal.subCategory[SubID].passengerCount;
            var driverTripTimerSecoends =
              catVal.subCategory[SubID].driverTripTimerSecoends;
            var subCategoryNo = catVal.subCategory[SubID].subCategoryNo;
            var vehiclesNew = catVal.subCategory[SubID].vehicles;
            var priceSelectionNew = catVal.subCategory[SubID].priceSelection;
            var roadPickupPriceSelectionNew =
              catVal.subCategory[SubID].roadPickupPriceSelection;
            catVal.subCategory.splice(i, 1);
          }
        }

        if (checkBool) {
          // ################################  price Selection array  ################################

          var subCategoryNew = [];

          subCategoryNew.push({
            subCategoryName: subCategoryUpdateObj.subCategory.subCategoryName,
            subCategoryNo: subCategoryUpdateObj.subCategory.subCategoryNo,
            subCategoryIcon: subCategoryIconNew,
            subCategoryIconSelected: subCategoryIconSelectedNew,
            tripSendDriversCount:
              subCategoryUpdateObj.subCategory.tripSendDriversCount,
            higherBidTripChanceCount:
              subCategoryUpdateObj.subCategory.higherBidTripChanceCount,
            subCategorySkippingCount:
              subCategoryUpdateObj.subCategory.subCategorySkippingCount,
            passengerCount: passengerCount,
            driverTripTimerSecoends:
              subCategoryUpdateObj.subCategory.driverTripTimerSecoends,
            mapIcon: mapIconNew,
            mapIconOffline: mapIconOffline,
            mapIconOntrip: mapIconOntrip,
            vehicles: vehiclesNew,
            priceSelection: priceSelectionNew,
            roadPickupPriceSelection: roadPickupPriceSelectionNew,
            subDescription: subCategoryUpdateObj.subCategory.subDescription,
            subIsEnable: subCategoryUpdateObj.subCategory.subIsEnable,
            packageDelivery: subCategoryUpdateObj.subCategory.packageDelivery,
          });

          var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

          var newValues = {
            $set: {
              subCategory: subCategoryNewn,
            },
          };

          VehicleCategory.findByIdAndUpdate(
            editID,
            newValues,
            function (err, result) {
              if (err) {
                console.log("error occured");
                throw err;
              } else {
                VehicleCategory.findById(editID).exec(function (err, user) {
                  if (err) {
                    console.log("error occured");
                  } else {
                    res.json({
                      message: "success",
                      details: "Sub category update successfully",
                      content: user,
                    });
                  }
                });
              }
            }
          );
        } else {
          res.json({
            message: "failed",
            details:
              "This subcategory name is not exits plz add the subcategory !",
            status: "update_failed",
          });
        }
      }
    }
  });
};

//############# vehicle #########################

exports.deleteVehicle = function (req, res) {
  VehicleCategory.findOne({
    categoryName: req.body.categoryName,
  }).exec(function (err, catVal) {
    if (err) {
      console.log("error occured");
    } else {
      if (catVal == null) {
        res.json({
          message: "failed",
          details: "category Name is not defined !",
          status: "category_not_exited",
        });
      } else {
        var editID = catVal._id;

        var checkBool = false;
        var checkBoolN = false;

        for (var i = 0; i < catVal.subCategory.length; i++) {
          if (
            catVal.subCategory[i].subCategoryName === req.body.subCategoryName
          ) {
            //check the sub category name already exit
            checkBool = true;
            var SubID = i;
          }
        }
        if (checkBool) {
          var subCategoryName = catVal.subCategory[SubID].subCategoryName;
          var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
          var subCategoryIconSelected =
            catVal.subCategory[SubID].subCategoryIconSelected;
          var mapIcon = catVal.subCategory[SubID].mapIcon;
          var mapIconOffline = catVal.subCategory[SubID].mapIconOffline;
          var mapIconOntrip = catVal.subCategory[SubID].mapIconOntrip;
          var vehicles = catVal.subCategory[SubID].vehicles;
          var subDescription = catVal.subCategory[SubID].subDescription;
          var subIsEnable = catVal.subCategory[SubID].subIsEnable;
          var packageDelivery = catVal.subCategory[SubID].packageDelivery;
          var priceSelection = catVal.subCategory[SubID].priceSelection;
          var roadPickupPriceSelection =
            catVal.subCategory[SubID].roadPickupPriceSelection;

          for (var j = 0; j < catVal.subCategory[SubID].vehicles.length; j++) {
            //console.log(req.body.districtName)
            if (
              catVal.subCategory[SubID].vehicles[j].modelType ===
              req.body.modelType
            ) {
              //check the district name already exit
              // catVal.subCategory[SubID].priceSelection.splice(j,1);
              checkBoolN = true;
              catVal.subCategory[SubID].vehicles.splice(j, 1);
            }
          }
          catVal.subCategory.splice(SubID, 1);

          if (checkBoolN) {
            // ################################  sub categoryNew array  ################################

            var subCategoryNew = [];

            subCategoryNew.push({
              subCategoryName: subCategoryName,
              subCategoryIcon: subCategoryIcon,
              subCategoryIconSelected: subCategoryIconSelected,
              mapIcon: mapIcon,
              mapIconOffline: mapIconOffline,
              mapIconOntrip: mapIconOntrip,
              vehicles: vehicles,
              priceSelection: priceSelection,
              roadPickupPriceSelection: roadPickupPriceSelection,
              subDescription: subDescription,
              subIsEnable: subIsEnable,
              packageDelivery: packageDelivery,
            });

            var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

            var newValues = {
              $set: {
                subCategory: subCategoryNewn,
              },
            };

            VehicleCategory.findByIdAndUpdate(
              editID,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  VehicleCategory.findById(editID).exec(function (err, user) {
                    if (err) {
                      console.log("error occured");
                    } else {
                      res.json({
                        message: "success",
                        details: "vehicle delete successfully",
                        content: user,
                      });
                    }
                  });
                }
              }
            );
          } else {
            res.json({
              message: "failed",
              details: "this model type is not exits !",
              status: "model_type_not_exited",
            });
          }
        } else {
          res.json({
            message: "failed",
            details: "This subcategory name is not exits !",
            status: "subCategory_not_exited",
          });
        }
      }
    }
  });
};

exports.addVehicle = function (req, res) {
  console.log("###### vehicle Category Add  ######");

  VehicleCategory.findOne({
    categoryName: req.body.vehicle.categoryName,
  }).exec(function (err, catVal) {
    if (err) {
      console.log("error occured");
    } else {
      if (catVal == null) {
        res.json({
          message: "failed",
          details: "This Category Name is not defined  !",
          status: "adding_failed",
        });
      } else {
        var checkBool = false;
        var checkBoolN = false;

        for (var i = 0; i < catVal.subCategory.length; i++) {
          if (
            catVal.subCategory[i].subCategoryName ===
            req.body.vehicle.subCategoryName
          ) {
            //check the sub category name already exit
            checkBool = true;
            var SubID = i;
          }
        }

        if (checkBool) {
          var subCategoryName = catVal.subCategory[SubID].subCategoryName;
          var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
          var subCategoryIconSelected =
            catVal.subCategory[SubID].subCategoryIconSelected;
          var mapIcon = catVal.subCategory[SubID].mapIcon;
          var mapIconOffline = catVal.subCategory[SubID].mapIconOffline;
          var mapIconOntrip = catVal.subCategory[SubID].mapIconOntrip;
          var vehicles = catVal.subCategory[SubID].vehicles;
          var subDescription = catVal.subCategory[SubID].subDescription;
          var subIsEnable = catVal.subCategory[SubID].subIsEnable;
          var packageDelivery = catVal.subCategory[SubID].packageDelivery;
          var priceSelection = catVal.subCategory[SubID].priceSelection;
          var roadPickupPriceSelection =
            catVal.subCategory[SubID].roadPickupPriceSelection;

          var vehiclesObj = req.body.vehicle;

          for (var j = 0; j < catVal.subCategory[SubID].vehicles.length; j++) {
            for (var p = 0; p < vehiclesObj.vehicles.length; p++) {
              if (
                catVal.subCategory[SubID].vehicles[j].vehicleBrand ===
                  vehiclesObj.vehicles[p].vehicleBrand &&
                catVal.subCategory[SubID].vehicles[j].modelType ===
                  vehiclesObj.vehicles[p].modelType
              ) {
                //check the district name already exit
                checkBoolN = true;
              }
            }
          }
          catVal.subCategory.splice(SubID, 1);

          if (!checkBoolN) {
            // ################################  vehicles array  ################################

            var vehiclesNew = [];
            for (var k = 0; k < vehiclesObj.vehicles.length; k++) {
              vehiclesNew.push({
                vehicleBrand: vehiclesObj.vehicles[k].vehicleBrand,
                vehicleName: vehiclesObj.vehicles[k].vehicleName,
                vehicleClass: vehiclesObj.vehicles[k].vehicleClass,
                modelType: vehiclesObj.vehicles[k].modelType,
                modelCapacity: vehiclesObj.vehicles[k].modelCapacity,
                vehiclePassengerCount:
                  vehiclesObj.vehicles[k].vehiclePassengerCount,
                vehicleCapacityWeightLimit:
                  vehiclesObj.vehicles[k].vehicleCapacityWeightLimit,
                "commission.adminCommission":
                  vehiclesObj.vehicles[k].commission.adminCommission,
                "commission.companyCommission":
                  vehiclesObj.vehicles[k].commission.companyCommission,
              });
            }

            var vehiclesNewn = vehiclesNew.concat(vehicles);

            var subCategoryNew = [];
            subCategoryNew.push({
              subCategoryName: subCategoryName,
              subCategoryIcon: subCategoryIcon,
              subCategoryIconSelected: subCategoryIconSelected,
              mapIcon: mapIcon,
              mapIconOffline: mapIconOffline,
              mapIconOntrip: mapIconOntrip,
              vehicles: vehiclesNewn,
              priceSelection: priceSelection,
              roadPickupPriceSelection: roadPickupPriceSelection,
              subDescription: subDescription,
              subIsEnable: subIsEnable,
              packageDelivery: packageDelivery,
            });

            var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

            ///console.log(vehiclesNewn)

            var newValues = {
              $set: {
                subCategory: subCategoryNewn,
              },
            };

            VehicleCategory.findByIdAndUpdate(
              catVal._id,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  VehicleCategory.findById(catVal._id).exec(function (
                    err,
                    user
                  ) {
                    if (err) {
                      console.log("error occured");
                    } else {
                      res.json({
                        message: "success",
                        details: "vehicles add successfully",
                        content: user,
                      });
                    }
                  });
                }
              }
            );
          } else {
            res.json({
              message: "failed",
              details: "this vehicle brand name or model type is exits !",
              status: "adding_failed",
            });
          }
        } else {
          res.json({
            message: "failed",
            details: "this subcategory name is not exits !",
            status: "adding_failed",
          });
        }
      }
    }
  });
};

exports.updateVehicle = function (req, res) {
  console.log("###### vehicle Category upadte vehicle ######");
  VehicleCategory.findOne({
    categoryName: req.body.categoryName,
  }).exec(function (err, catVal) {
    if (err) {
      console.log("error occured");
    } else {
      if (catVal == null) {
        res.json({
          message: "failed",
          details: "this category name is not defined  !",
          status: "update_failed",
        });
      } else {
        var editID = catVal._id;

        var checkBool = false;
        var checkBoolN = false;

        for (var i = 0; i < catVal.subCategory.length; i++) {
          if (
            catVal.subCategory[i].subCategoryName === req.body.subCategoryName
          ) {
            //check the sub category name already exit
            checkBool = true;
            var SubID = i;
          }
        }

        if (checkBool) {
          var subCategoryName = catVal.subCategory[SubID].subCategoryName;
          var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
          var subCategoryIconSelected =
            catVal.subCategory[SubID].subCategoryIconSelected;
          var mapIcon = catVal.subCategory[SubID].mapIcon;
          var mapIconOffline = catVal.subCategory[SubID].mapIconOffline;
          var mapIconOntrip = catVal.subCategory[SubID].mapIconOntrip;
          var vehicles = catVal.subCategory[SubID].vehicles;
          var subDescription = catVal.subCategory[SubID].subDescription;
          var subIsEnable = catVal.subCategory[SubID].subIsEnable;
          var packageDelivery = catVal.subCategory[SubID].packageDelivery;
          var priceSelection = catVal.subCategory[SubID].priceSelection;
          var roadPickupPriceSelection =
            catVal.subCategory[SubID].roadPickupPriceSelection;

          for (var j = 0; j < catVal.subCategory[SubID].vehicles.length; j++) {
            if (
              catVal.subCategory[SubID].vehicles[j].modelType ===
              req.body.modelType
            ) {
              //check the district name already exit
              checkBoolN = true;
              catVal.subCategory[SubID].vehicles.splice(j, 1);
            }
          }
          catVal.subCategory.splice(SubID, 1);

          if (checkBoolN) {
            // ################################  vehicle array  ################################
            var vehiclesNew = [];

            vehiclesNew.push({
              vehicleBrand: req.body.vehicleBrand,
              vehicleName: req.body.vehicleName,
              vehicleClass: req.body.vehicleClass,
              modelType: req.body.modelType,
              modelCapacity: req.body.modelCapacity,
              vehiclePassengerCount: req.body.vehiclePassengerCount,
              vehicleCapacityWeightLimit: req.body.vehicleCapacityWeightLimit,
              "commission.adminCommission": req.body.adminCommission,
              "commission.companyCommission": req.body.companyCommission,
            });

            var vehiclesNewn = vehiclesNew.concat(vehicles);

            var subCategoryNew = [];

            subCategoryNew.push({
              subCategoryName: subCategoryName,
              subCategoryIcon: subCategoryIcon,
              subCategoryIconSelected: subCategoryIconSelected,
              mapIcon: mapIcon,
              mapIconOffline: mapIconOffline,
              mapIconOntrip: mapIconOntrip,
              vehicles: vehiclesNewn,
              priceSelection: priceSelection,
              roadPickupPriceSelection: roadPickupPriceSelection,
              subDescription: subDescription,
              subIsEnable: subIsEnable,
              packageDelivery: packageDelivery,
            });

            var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

            var newValues = {
              $set: {
                subCategory: subCategoryNewn,
              },
            };

            VehicleCategory.findByIdAndUpdate(
              editID,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  VehicleCategory.findById(editID).exec(function (err, user) {
                    if (err) {
                      console.log("error occured");
                    } else {
                      res.json({
                        message: "success",
                        details: "vehicle update successfully",
                        content: user,
                      });
                    }
                  });
                }
              }
            );
          } else {
            res.json({
              message: "failed",
              details: "this model type is not exits !",
              status: "update_failed",
            });
          }
        } else {
          res.json({
            message: "failed",
            details:
              "this subcategory name is not exits plz add the subcategory !",
            status: "update_failed",
          });
        }
      }
    }
  });
};

//############# price Selection #########################

exports.addPriceSelection = function (req, res) {
  console.log("###### vehicle Category Add sub category ######");

  VehicleCategory.findOne({
    categoryName: req.body.priceSelectionObj.categoryName,
  }).exec(function (err, catVal) {
    if (err) {
      console.log("error occured");
    } else {
      if (catVal == null) {
        res.json({
          message: "failed",
          details: "This Category Name is not defined  !",
          status: "adding_failed",
        });
      } else {
        var editID = catVal._id;

        var checkBool = false;
        var checkBoolN = false;

        for (var i = 0; i < catVal.subCategory.length; i++) {
          if (
            catVal.subCategory[i].subCategoryName ===
            req.body.priceSelectionObj.subCategoryName
          ) {
            //check the sub category name already exit
            checkBool = true;
            var SubID = i;
          }
        }

        // Main Object
        var Obj = req.body.priceSelectionObj;

        if (checkBool) {
          var subCategoryName = catVal.subCategory[SubID].subCategoryName;
          var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
          var subCategoryIconSelected =
            catVal.subCategory[SubID].subCategoryIconSelected;
          var subCategoryNo = catVal.subCategory[SubID].subCategoryNo;
          var tripSendDriversCount =
            catVal.subCategory[SubID].tripSendDriversCount;
          var higherBidTripChanceCount =
            catVal.subCategory[SubID].higherBidTripChanceCount;
          var subCategorySkippingCount =
            catVal.subCategory[SubID].subCategorySkippingCount;
          var passengerCount = catVal.subCategory[SubID].passengerCount;
          var driverTripTimerSecoends =
            catVal.subCategory[SubID].driverTripTimerSecoends;
          var mapIcon = catVal.subCategory[SubID].mapIcon;
          var mapIconOffline = catVal.subCategory[SubID].mapIconOffline;
          var mapIconOntrip = catVal.subCategory[SubID].mapIconOntrip;
          var vehicles = catVal.subCategory[SubID].vehicles;
          var subDescription = catVal.subCategory[SubID].subDescription;
          var subIsEnable = catVal.subCategory[SubID].subIsEnable;
          var packageDelivery = catVal.subCategory[SubID].packageDelivery;
          var priceSelection = catVal.subCategory[SubID].priceSelection;
          var roadPickupPriceSelection =
            catVal.subCategory[SubID].roadPickupPriceSelection;

          for (
            var j = 0;
            j < catVal.subCategory[SubID].priceSelection.length;
            j++
          ) {
            for (var p = 0; p < Obj.priceSelection.length; p++) {
              if (
                catVal.subCategory[SubID].priceSelection[j].districtName ===
                Obj.priceSelection[p].districtName
              ) {
                //check the district name already exit
                checkBoolN = true;
              }
            }
          }
          catVal.subCategory.splice(SubID, 1);

          if (!checkBoolN) {
            var priceSelectionNew = [];
            var timeBaseNew = [];

            for (var q = 0; q < Obj.priceSelection.length; q++) {
              // ################################  price Selection array  ################################

              for (var p = 0; p < Obj.priceSelection[q].timeBase.length; p++) {
                timeBaseNew.push({
                  timeSlotName: Obj.priceSelection[q].timeBase[p].timeSlotName,
                  startingTime: Obj.priceSelection[q].timeBase[p].startingTime,
                  endingTime: Obj.priceSelection[q].timeBase[p].endingTime,
                  districtPrice:
                    Obj.priceSelection[q].timeBase[p].districtPrice,
                  lowerBidLimit:
                    Obj.priceSelection[q].timeBase[p].lowerBidLimit,
                  upperBidLimit:
                    Obj.priceSelection[q].timeBase[p].upperBidLimit,
                  baseFare: Obj.priceSelection[q].timeBase[p].baseFare,
                  minimumFare: Obj.priceSelection[q].timeBase[p].minimumFare,
                  minimumKM: Obj.priceSelection[q].timeBase[p].minimumKM,
                  belowAboveKMRange:
                    Obj.priceSelection[q].timeBase[p].belowAboveKMRange,
                  aboveKMFare: Obj.priceSelection[q].timeBase[p].aboveKMFare,
                  belowKMFare: Obj.priceSelection[q].timeBase[p].belowKMFare,
                  trafficWaitingChargePerMinute:
                    Obj.priceSelection[q].timeBase[p]
                      .trafficWaitingChargePerMinute,
                  normalWaitingChargePerMinute:
                    Obj.priceSelection[q].timeBase[p]
                      .normalWaitingChargePerMinute,
                  radius: Obj.priceSelection[q].timeBase[p].radius,
                  packageDeliveryKMPerHour:
                    Obj.priceSelection[q].timeBase[p].packageDeliveryKMPerHour,
                  packageDeliveryKMPerDay:
                    Obj.priceSelection[q].timeBase[p].packageDeliveryKMPerDay,

                  tripCancelationFee:
                    Obj.priceSelection[q].timeBase[p].tripCancelationFee,
                  maxWaitingTimeWithoutCharge:
                    Obj.priceSelection[q].timeBase[p]
                      .maxWaitingTimeWithoutCharge,
                });
              }

              priceSelectionNew.push({
                districtName: Obj.priceSelection[q].districtName,
                timeBase: timeBaseNew,
              });
              var timeBaseNew = [];
            }

            var priceSelectionNewn = priceSelectionNew.concat(priceSelection);

            var subCategoryNew = [];
            subCategoryNew.push({
              subCategoryName: subCategoryName,
              subCategoryIcon: subCategoryIcon,
              subCategoryIconSelected: subCategoryIconSelected,
              subCategoryNo: subCategoryNo,
              tripSendDriversCount: tripSendDriversCount,
              higherBidTripChanceCount: higherBidTripChanceCount,
              subCategorySkippingCount: subCategorySkippingCount,
              passengerCount: passengerCount,
              driverTripTimerSecoends: driverTripTimerSecoends,
              mapIcon: mapIcon,
              mapIconOffline: mapIconOffline,
              mapIconOntrip: mapIconOntrip,
              vehicles: vehicles,
              priceSelection: priceSelectionNewn,
              roadPickupPriceSelection: roadPickupPriceSelection,
              subDescription: subDescription,
              subIsEnable: subIsEnable,
              packageDelivery: packageDelivery,
            });

            var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

            console.log(subCategoryNewn);

            var newValues = {
              $set: {
                subCategory: subCategoryNewn,
              },
            };

            VehicleCategory.findByIdAndUpdate(
              editID,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  VehicleCategory.findById(editID).exec(function (err, user) {
                    if (err) {
                      console.log("error occured");
                    } else {
                      res.json({
                        message: "success",
                        details: "Price Selection add successfully",
                        content: user,
                      });
                    }
                  });
                }
              }
            );
          } else {
            res.json({
              message: "failed",
              details: "This district name is exits !",
              status: "adding_failed",
            });
          }
        } else {
          res.json({
            message: "failed",
            details: "This subcategory name is not exits !",
            status: "adding_failed",
          });
        }
      }
    }
  });
};

exports.updatePriceSelection = function (req, res) {
  console.log("###### vehicle Category Add sub category ######");

  VehicleCategory.findOne({
    categoryName: req.body.categoryName,
  }).exec(function (err, catVal) {
    if (err) {
      console.log("error occured");
    } else {
      if (catVal == null) {
        res.json({
          message: "failed",
          details: "This Category Name is not defined!",
          status: "update_failed",
        });
      } else {
        var editID = catVal._id;

        var checkBool = false;
        var checkBoolN = false;
        var checkBoolM = false;

        for (var i = 0; i < catVal.subCategory.length; i++) {
          if (
            catVal.subCategory[i].subCategoryName === req.body.subCategoryName
          ) {
            //check the sub category name already exit
            checkBool = true;
            var SubID = i;
          }
        }

        if (checkBool) {
          var subCategoryName = catVal.subCategory[SubID].subCategoryName;
          var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
          var subCategoryIconSelected =
            catVal.subCategory[SubID].subCategoryIconSelected;
          var subCategoryNo = catVal.subCategory[SubID].subCategoryNo;
          var tripSendDriversCount =
            catVal.subCategory[SubID].tripSendDriversCount;
          var higherBidTripChanceCount =
            catVal.subCategory[SubID].higherBidTripChanceCount;
          var subCategorySkippingCount =
            catVal.subCategory[SubID].subCategorySkippingCount;
          var passengerCount = catVal.subCategory[SubID].passengerCount;
          var driverTripTimerSecoends =
            catVal.subCategory[SubID].driverTripTimerSecoends;
          var mapIcon = catVal.subCategory[SubID].mapIcon;
          var mapIconOffline = catVal.subCategory[SubID].mapIconOffline;
          var mapIconOntrip = catVal.subCategory[SubID].mapIconOntrip;
          var vehicles = catVal.subCategory[SubID].vehicles;
          var subDescription = catVal.subCategory[SubID].subDescription;
          var subIsEnable = catVal.subCategory[SubID].subIsEnable;
          var packageDelivery = catVal.subCategory[SubID].packageDelivery;
          var priceSelection = catVal.subCategory[SubID].priceSelection;
          var roadPickupPriceSelection =
            catVal.subCategory[SubID].roadPickupPriceSelection;

          for (
            var j = 0;
            j < catVal.subCategory[SubID].priceSelection.length;
            j++
          ) {
            //  console.log(">>",catVal.subCategory[SubID].priceSelection[j].timeBase)
            if (
              catVal.subCategory[SubID].priceSelection[j].districtName ===
              req.body.districtName
            ) {
              //check the district name already exit
              checkBoolN = true;
              var pricID = j;
            }
          }

          if (checkBoolN) {
            console.log("###########");

            // for (var u = 0; u < catVal.subCategory[SubID].priceSelection[pricID].timeBase.length; u++) {

            //   if (catVal.subCategory[SubID].priceSelection[pricID].timeBase[u].timeSlotName === req.body.timeSlotName) {
            //check the district name already exit
            checkBoolM = true;
            // var timeID = u;
            // catVal.subCategory[SubID].priceSelection[pricID].timeSlotName.splice(timeID,1);
            //   }
            // }

            if (checkBoolM) {
              var timeBaseNew = [];
              // remove array
              catVal.subCategory[SubID].priceSelection.splice(pricID, 1);
              catVal.subCategory.splice(SubID, 1);

              // ################################  price Selection array  ################################

              req.body.timeBase.forEach((element) => {
                timeBaseNew.push({
                  timeSlotName: element.timeSlotName,
                  startingTime: element.startingTime,
                  endingTime: element.endingTime,
                  districtPrice: element.districtPrice,
                  lowerBidLimit: element.lowerBidLimit,
                  upperBidLimit: element.upperBidLimit,
                  baseFare: element.baseFare,
                  minimumFare: element.minimumFare,
                  minimumKM: element.minimumKM,
                  belowAboveKMRange: element.belowAboveKMRange,
                  aboveKMFare: element.aboveKMFare,
                  belowKMFare: element.belowKMFare,
                  trafficWaitingChargePerMinute:
                    element.trafficWaitingChargePerMinute,
                  normalWaitingChargePerMinute:
                    element.normalWaitingChargePerMinute,
                  radius: element.radius,
                  packageDeliveryKMPerHour: element.packageDeliveryKMPerHour,
                  packageDeliveryKMPerDay: element.packageDeliveryKMPerDay,

                  tripCancelationFee: element.tripCancelationFee,
                  maxWaitingTimeWithoutCharge:
                    element.maxWaitingTimeWithoutCharge,
                });
              });

              var priceSelectionNew = [];
              priceSelectionNew.push({
                districtName: req.body.districtName,
                timeBase: timeBaseNew,
              });

              var priceSelectionNewn = priceSelectionNew.concat(priceSelection);

              var subCategoryNew = [];

              subCategoryNew.push({
                subCategoryName: subCategoryName,
                subCategoryNo: subCategoryNo,
                tripSendDriversCount: tripSendDriversCount,
                higherBidTripChanceCount: higherBidTripChanceCount,
                subCategorySkippingCount: subCategorySkippingCount,
                passengerCount: passengerCount,
                driverTripTimerSecoends: driverTripTimerSecoends,
                subCategoryIcon: subCategoryIcon,
                subCategoryIconSelected: subCategoryIconSelected,
                mapIcon: mapIcon,
                mapIconOffline: mapIconOffline,
                mapIconOntrip: mapIconOntrip,
                vehicles: vehicles,
                priceSelection: priceSelectionNewn,
                roadPickupPriceSelection: roadPickupPriceSelection,
                subDescription: subDescription,
                subIsEnable: subIsEnable,
                packageDelivery: packageDelivery,
              });

              var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

              var newValues = {
                $set: {
                  subCategory: subCategoryNewn,
                },
              };

              VehicleCategory.findByIdAndUpdate(
                editID,
                newValues,
                function (err, result) {
                  if (err) {
                    console.log("error occured");
                    throw err;
                  } else {
                    VehicleCategory.findById(editID).exec(function (err, user) {
                      if (err) {
                        console.log("error occured");
                      } else {
                        res.json({
                          message: "success",
                          details: "Price Selection update successfully",
                          content: user,
                        });
                      }
                    });
                  }
                }
              );
            } else {
              res.json({
                message: "failed",
                details: "This time slot name is not exits !",
                status: "update_failed",
              });
            }
          } else {
            res.json({
              message: "failed",
              details:
                "This district name is not exits plz add district name !",
              status: "update_failed",
            });
          }
        } else {
          res.json({
            message: "failed",
            details:
              "This subcategory name is not exits plz add the subcategory !",
            status: "update_failed",
          });
        }
      }
    }
  });
};

exports.deletePriceSelection = function (req, res) {
  console.log("###### vehicle Category Add sub category ######");

  VehicleCategory.findOne({
    categoryName: req.body.categoryName,
  }).exec(function (err, catVal) {
    if (err) {
      console.log("error occured");
    } else {
      if (catVal == null) {
        res.json({
          message: "failed",
          details: "category Name is not defined !",
          status: "category_not_exited",
        });
      } else {
        var editID = catVal._id;

        var checkBool = false;
        var checkBoolN = false;

        for (var i = 0; i < catVal.subCategory.length; i++) {
          if (
            catVal.subCategory[i].subCategoryName === req.body.subCategoryName
          ) {
            //check the sub category name already exit
            checkBool = true;
            var SubID = i;
          }
        }
        if (checkBool) {
          var subCategoryName = catVal.subCategory[SubID].subCategoryName;
          var subCategoryNo = catVal.subCategory[SubID].subCategoryNo;
          var tripSendDriversCount =
            catVal.subCategory[SubID].tripSendDriversCount;
          var higherBidTripChanceCount =
            catVal.subCategory[SubID].higherBidTripChanceCount;
          var subCategorySkippingCount =
            catVal.subCategory[SubID].subCategorySkippingCount;
          var passengerCount = catVal.subCategory[SubID].passengerCount;
          var driverTripTimerSecoends =
            catVal.subCategory[SubID].driverTripTimerSecoends;
          var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
          var subCategoryIconSelected =
            catVal.subCategory[SubID].subCategoryIconSelected;
          var mapIcon = catVal.subCategory[SubID].mapIcon;
          var mapIconOffline = catVal.subCategory[SubID].mapIconOffline;
          var mapIconOntrip = catVal.subCategory[SubID].mapIconOntrip;
          var vehicles = catVal.subCategory[SubID].vehicles;
          var subDescription = catVal.subCategory[SubID].subDescription;
          var subIsEnable = catVal.subCategory[SubID].subIsEnable;
          var packageDelivery = catVal.subCategory[SubID].packageDelivery;
          var priceSelection = catVal.subCategory[SubID].priceSelection;
          var roadPickupPriceSelection =
            catVal.subCategory[SubID].roadPickupPriceSelection;

          for (
            var j = 0;
            j < catVal.subCategory[SubID].priceSelection.length;
            j++
          ) {
            //console.log(req.body.districtName)
            if (
              catVal.subCategory[SubID].priceSelection[j].districtName ===
              req.body.districtName
            ) {
              //check the district name already exit
              // catVal.subCategory[SubID].priceSelection.splice(j,1);
              checkBoolN = true;
              catVal.subCategory[SubID].priceSelection.splice(j, 1);
            }
          }
          catVal.subCategory.splice(SubID, 1);

          if (checkBoolN) {
            // ################################  sub categoryNew array  ################################

            var subCategoryNew = [];

            subCategoryNew.push({
              subCategoryName: subCategoryName,
              subCategoryNo: subCategoryNo,
              tripSendDriversCount: tripSendDriversCount,
              higherBidTripChanceCount: higherBidTripChanceCount,
              subCategorySkippingCount: subCategorySkippingCount,
              passengerCount: passengerCount,
              driverTripTimerSecoends: driverTripTimerSecoends,
              subCategoryIcon: subCategoryIcon,
              subCategoryIconSelected: subCategoryIconSelected,
              mapIcon: mapIcon,
              mapIconOffline: mapIconOffline,
              mapIconOntrip: mapIconOntrip,
              vehicles: vehicles,
              priceSelection: priceSelection,
              roadPickupPriceSelection: roadPickupPriceSelection,
              subDescription: subDescription,
              subIsEnable: subIsEnable,
              packageDelivery: packageDelivery,
            });

            var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

            var newValues = {
              $set: {
                subCategory: subCategoryNewn,
              },
            };

            VehicleCategory.findByIdAndUpdate(
              editID,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  VehicleCategory.findById(editID).exec(function (err, user) {
                    if (err) {
                      console.log("error occured");
                    } else {
                      res.json({
                        message: "success",
                        details: "Price Selection delete successfully",
                        content: user,
                      });
                    }
                  });
                }
              }
            );
          } else {
            res.json({
              message: "failed",
              details: "This district name is exits !",
              status: "district_name_not_exited",
            });
          }
        } else {
          res.json({
            message: "failed",
            details: "This subcategory name is not exits !",
            status: "subCategory_not_exited",
          });
        }
      }
    }
  });
};

//############# road pickup price selection #########################

exports.addRoadPickupPriceSelection = function (req, res) {
  console.log("###### vehicle Category Ad road Pickup Price Selection ######");
  VehicleCategory.findOne({
    categoryName: req.body.roadPickupPriceSelectionObj.categoryName,
  }).exec(function (err, catVal) {
    if (err) {
      console.log("error occured");
    } else {
      if (catVal == null) {
        res.json({
          message: "failed",
          details: "This Category Name is not defined  !",
          status: "adding_failed",
        });
      } else {
        var editID = catVal._id;

        var checkBool = false;
        var checkBoolN = false;

        for (var i = 0; i < catVal.subCategory.length; i++) {
          if (
            catVal.subCategory[i].subCategoryName ===
            req.body.roadPickupPriceSelectionObj.subCategoryName
          ) {
            //check the sub category name already exit
            checkBool = true;
            var SubID = i;
          }
        }

        // Main Object
        var Obj = req.body.roadPickupPriceSelectionObj;

        if (checkBool) {
          var subCategoryName = catVal.subCategory[SubID].subCategoryName;
          var subCategoryNo = catVal.subCategory[SubID].subCategoryNo;
          var tripSendDriversCount =
            catVal.subCategory[SubID].tripSendDriversCount;
          var higherBidTripChanceCount =
            catVal.subCategory[SubID].higherBidTripChanceCount;
          var subCategorySkippingCount =
            catVal.subCategory[SubID].subCategorySkippingCount;
          var passengerCount = catVal.subCategory[SubID].passengerCount;
          var driverTripTimerSecoends =
            catVal.subCategory[SubID].driverTripTimerSecoends;
          var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
          var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
          var subCategoryIconSelected =
            catVal.subCategory[SubID].subCategoryIconSelected;
          var mapIcon = catVal.subCategory[SubID].mapIcon;
          var mapIconOffline = catVal.subCategory[SubID].mapIconOffline;
          var mapIconOntrip = catVal.subCategory[SubID].mapIconOntrip;
          var vehicles = catVal.subCategory[SubID].vehicles;
          var subDescription = catVal.subCategory[SubID].subDescription;
          var subIsEnable = catVal.subCategory[SubID].subIsEnable;
          var packageDelivery = catVal.subCategory[SubID].packageDelivery;
          var priceSelection = catVal.subCategory[SubID].priceSelection;
          var roadPickupPriceSelection =
            catVal.subCategory[SubID].roadPickupPriceSelection;

          for (
            var j = 0;
            j < catVal.subCategory[SubID].roadPickupPriceSelection.length;
            j++
          ) {
            for (var p = 0; p < Obj.roadPickupPriceSelection.length; p++) {
              if (
                catVal.subCategory[SubID].roadPickupPriceSelection[j]
                  .districtName === Obj.roadPickupPriceSelection[p].districtName
              ) {
                //check the district name already exit
                checkBoolN = true;
              }
            }
          }
          catVal.subCategory.splice(SubID, 1);

          if (!checkBoolN) {
            var roadPickupPriceSelectionNew = [];
            var roadPickuptimeBaseNew = [];

            for (var q = 0; q < Obj.roadPickupPriceSelection.length; q++) {
              // ################################  price Selection array  ################################

              for (
                var p = 0;
                p < Obj.roadPickupPriceSelection[q].timeBase.length;
                p++
              ) {
                roadPickuptimeBaseNew.push({
                  timeSlotName:
                    Obj.roadPickupPriceSelection[q].timeBase[p].timeSlotName,
                  startingTime:
                    Obj.roadPickupPriceSelection[q].timeBase[p].startingTime,
                  endingTime:
                    Obj.roadPickupPriceSelection[q].timeBase[p].endingTime,
                  districtPrice:
                    Obj.roadPickupPriceSelection[q].timeBase[p].districtPrice,
                  baseFare:
                    Obj.roadPickupPriceSelection[q].timeBase[p].baseFare,
                  minimumFare:
                    Obj.roadPickupPriceSelection[q].timeBase[p].minimumFare,
                  minimumKM:
                    Obj.roadPickupPriceSelection[q].timeBase[p].minimumKM,
                  belowAboveKMRange:
                    Obj.roadPickupPriceSelection[q].timeBase[p]
                      .belowAboveKMRange,
                  aboveKMFare:
                    Obj.roadPickupPriceSelection[q].timeBase[p].aboveKMFare,
                  belowKMFare:
                    Obj.roadPickupPriceSelection[q].timeBase[p].belowKMFare,
                  trafficWaitingChargePerMinute:
                    Obj.roadPickupPriceSelection[q].timeBase[p]
                      .trafficWaitingChargePerMinute,
                  normalWaitingChargePerMinute:
                    Obj.roadPickupPriceSelection[q].timeBase[p]
                      .normalWaitingChargePerMinute,
                  radius: Obj.roadPickupPriceSelection[q].timeBase[p].radius,
                  packageDeliveryKMPerHour:
                    Obj.roadPickupPriceSelection[q].timeBase[p]
                      .packageDeliveryKMPerHour,
                  packageDeliveryKMPerDay:
                    Obj.roadPickupPriceSelection[q].timeBase[p]
                      .packageDeliveryKMPerDay,
                });
              }

              roadPickupPriceSelectionNew.push({
                districtName: Obj.roadPickupPriceSelection[q].districtName,
                timeBase: roadPickuptimeBaseNew,
              });
              var roadPickuptimeBaseNew = [];
            }

            var roadPickupPriceSelectionNewn =
              roadPickupPriceSelectionNew.concat(roadPickupPriceSelection);

            var subCategoryNew = [];
            subCategoryNew.push({
              subCategoryName: subCategoryName,
              subCategoryNo: subCategoryNo,
              tripSendDriversCount: tripSendDriversCount,
              higherBidTripChanceCount: higherBidTripChanceCount,
              subCategorySkippingCount: subCategorySkippingCount,
              passengerCount: passengerCount,
              driverTripTimerSecoends: driverTripTimerSecoends,
              subCategoryIcon: subCategoryIcon,
              subCategoryIconSelected: subCategoryIconSelected,
              mapIcon: mapIcon,
              mapIconOffline: mapIconOffline,
              mapIconOntrip: mapIconOntrip,
              vehicles: vehicles,
              priceSelection: priceSelection,
              roadPickupPriceSelection: roadPickupPriceSelectionNewn,
              subDescription: subDescription,
              subIsEnable: subIsEnable,
              packageDelivery: packageDelivery,
            });

            var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

            var newValues = {
              $set: {
                subCategory: subCategoryNewn,
              },
            };

            VehicleCategory.findByIdAndUpdate(
              editID,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  VehicleCategory.findById(editID).exec(function (err, user) {
                    if (err) {
                      console.log("error occured");
                    } else {
                      res.json({
                        message: "success",
                        details: "Road Pickup Price Selection add successfully",
                        content: user,
                      });
                    }
                  });
                }
              }
            );
          } else {
            res.json({
              message: "failed",
              details: "This district name is exits !",
              status: "adding_failed",
            });
          }
        } else {
          res.json({
            message: "failed",
            details: "This subcategory name is not exits !",
            status: "adding_failed",
          });
        }
      }
    }
  });
};

exports.updateRoadPickupPriceSelection = function (req, res) {
  console.log(
    "###### vehicle Category Add sub category  road pickup price selection ######"
  );
  VehicleCategory.findOne({
    categoryName: req.body.categoryName,
  }).exec(function (err, catVal) {
    if (err) {
      console.log("error occured");
    } else {
      if (catVal == null) {
        res.json({
          message: "failed",
          details: "This Category Name is not defined  !",
          status: "update_failed",
        });
      } else {
        var editID = catVal._id;

        var checkBool = false;
        var checkBoolN = false;
        var checkBoolM = false;

        for (var i = 0; i < catVal.subCategory.length; i++) {
          if (
            catVal.subCategory[i].subCategoryName === req.body.subCategoryName
          ) {
            //check the sub category name already exit
            checkBool = true;
            var SubID = i;
          }
        }

        if (checkBool) {
          var subCategoryName = catVal.subCategory[SubID].subCategoryName;
          var subCategoryNo = catVal.subCategory[SubID].subCategoryNo;
          var tripSendDriversCount =
            catVal.subCategory[SubID].tripSendDriversCount;
          var higherBidTripChanceCount =
            catVal.subCategory[SubID].higherBidTripChanceCount;
          var subCategorySkippingCount =
            catVal.subCategory[SubID].subCategorySkippingCount;
          var passengerCount = catVal.subCategory[SubID].passengerCount;
          var driverTripTimerSecoends =
            catVal.subCategory[SubID].driverTripTimerSecoends;
          var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
          var subCategoryIconSelected =
            catVal.subCategory[SubID].subCategoryIconSelected;
          var mapIcon = catVal.subCategory[SubID].mapIcon;
          var mapIconOffline = catVal.subCategory[SubID].mapIconOffline;
          var mapIconOntrip = catVal.subCategory[SubID].mapIconOntrip;
          var vehicles = catVal.subCategory[SubID].vehicles;
          var subDescription = catVal.subCategory[SubID].subDescription;
          var subIsEnable = catVal.subCategory[SubID].subIsEnable;
          var packageDelivery = catVal.subCategory[SubID].packageDelivery;
          var priceSelection = catVal.subCategory[SubID].priceSelection;
          var roadPickupPriceSelection =
            catVal.subCategory[SubID].roadPickupPriceSelection;

          for (
            var j = 0;
            j < catVal.subCategory[SubID].roadPickupPriceSelection.length;
            j++
          ) {
            if (
              catVal.subCategory[SubID].roadPickupPriceSelection[j]
                .districtName === req.body.districtName
            ) {
              //check the district name already exit
              checkBoolN = true;
              var pricID = j;
            }
          }

          if (checkBoolN) {
            for (
              var u = 0;
              u <
              catVal.subCategory[SubID].roadPickupPriceSelection[pricID]
                .timeBase.length;
              u++
            ) {
              if (
                catVal.subCategory[SubID].roadPickupPriceSelection[pricID]
                  .timeBase[u].timeSlotName === req.body.timeSlotName
              ) {
                //check the district name already exit
                checkBoolM = true;
                var timeID = u;
                // catVal.subCategory[SubID].priceSelection[pricID].timeSlotName.splice(timeID,1);
              }
            }

            if (checkBoolM) {
              var timeBaseNew = [];
              // remove array
              catVal.subCategory[SubID].roadPickupPriceSelection.splice(
                pricID,
                1
              );
              catVal.subCategory.splice(SubID, 1);

              // ################################  price Selection array  ################################
              req.body.timeBase.forEach((element) => {
                timeBaseNew.push({
                  timeSlotName: element.timeSlotName,
                  startingTime: element.startingTime,
                  endingTime: element.endingTime,
                  districtPrice: element.districtPrice,
                  baseFare: element.baseFare,
                  minimumFare: element.minimumFare,
                  minimumKM: element.minimumKM,
                  belowAboveKMRange: element.belowAboveKMRange,
                  aboveKMFare: element.aboveKMFare,
                  belowKMFare: element.belowKMFare,
                  trafficWaitingChargePerMinute:
                    element.trafficWaitingChargePerMinute,
                  normalWaitingChargePerMinute:
                    element.normalWaitingChargePerMinute,
                  radius: element.radius,
                  packageDeliveryKMPerHour: element.packageDeliveryKMPerHour,
                  packageDeliveryKMPerDay: element.packageDeliveryKMPerDay,
                });
              });

              var roadPickupPriceSelectionNew = [];
              roadPickupPriceSelectionNew.push({
                districtName: req.body.districtName,
                timeBase: timeBaseNew,
              });

              var roadPickupPriceSelectionNewn =
                roadPickupPriceSelectionNew.concat(roadPickupPriceSelection);

              var subCategoryNew = [];

              subCategoryNew.push({
                subCategoryName: subCategoryName,
                subCategoryNo: subCategoryNo,
                tripSendDriversCount: tripSendDriversCount,
                higherBidTripChanceCount: higherBidTripChanceCount,
                subCategorySkippingCount: subCategorySkippingCount,
                passengerCount: passengerCount,
                driverTripTimerSecoends: driverTripTimerSecoends,
                subCategoryIcon: subCategoryIcon,
                subCategoryIconSelected: subCategoryIconSelected,
                mapIcon: mapIcon,
                mapIconOffline: mapIconOffline,
                mapIconOntrip: mapIconOntrip,
                vehicles: vehicles,
                priceSelection: priceSelection,
                roadPickupPriceSelection: roadPickupPriceSelectionNewn,
                subDescription: subDescription,
                subIsEnable: subIsEnable,
                packageDelivery: packageDelivery,
              });

              var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

              var newValues = {
                $set: {
                  subCategory: subCategoryNewn,
                },
              };

              VehicleCategory.findByIdAndUpdate(
                editID,
                newValues,
                function (err, result) {
                  if (err) {
                    console.log("error occured");
                    throw err;
                  } else {
                    VehicleCategory.findById(editID).exec(function (err, user) {
                      if (err) {
                        console.log("error occured");
                      } else {
                        res.json({
                          message: "success",
                          details:
                            "Road pickup price selection update successfully",
                          content: user,
                        });
                      }
                    });
                  }
                }
              );
            } else {
              res.json({
                message: "failed",
                details: "This time slot name is not exits !",
                status: "update_failed",
              });
            }
          } else {
            res.json({
              message: "failed",
              details:
                "This district name is not exits plz add district name !",
              status: "update_failed",
            });
          }
        } else {
          res.json({
            message: "failed",
            details:
              "This subcategory name is not exits plz add the subcategory !",
            status: "update_failed",
          });
        }
      }
    }
  });
};

exports.deleteRoadPickupPriceSelection = function (req, res) {
  console.log(
    "###### vehicle Category delete sub category road pickup price selection ######"
  );
  VehicleCategory.findOne({
    categoryName: req.body.categoryName,
  }).exec(function (err, catVal) {
    if (err) {
      console.log("error occured");
    } else {
      if (catVal == null) {
        res.json({
          message: "failed",
          details: "category Name is not defined !",
          status: "category_not_exited",
        });
      } else {
        var editID = catVal._id;

        var checkBool = false;
        var checkBoolN = false;

        for (var i = 0; i < catVal.subCategory.length; i++) {
          if (
            catVal.subCategory[i].subCategoryName === req.body.subCategoryName
          ) {
            //check the sub category name already exit
            checkBool = true;
            var SubID = i;
          }
        }
        if (checkBool) {
          var subCategoryName = catVal.subCategory[SubID].subCategoryName;
          var subCategoryNo = catVal.subCategory[SubID].subCategoryNo;
          var tripSendDriversCount =
            catVal.subCategory[SubID].tripSendDriversCount;
          var higherBidTripChanceCount =
            catVal.subCategory[SubID].higherBidTripChanceCount;
          var subCategorySkippingCount =
            catVal.subCategory[SubID].subCategorySkippingCount;
          var passengerCount = catVal.subCategory[SubID].passengerCount;
          var driverTripTimerSecoends =
            catVal.subCategory[SubID].driverTripTimerSecoends;
          var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
          var subCategoryIconSelected =
            catVal.subCategory[SubID].subCategoryIconSelected;
          var mapIcon = catVal.subCategory[SubID].mapIcon;
          var mapIconOffline = catVal.subCategory[SubID].mapIconOffline;
          var mapIconOntrip = catVal.subCategory[SubID].mapIconOntrip;
          var vehicles = catVal.subCategory[SubID].vehicles;
          var subDescription = catVal.subCategory[SubID].subDescription;
          var subIsEnable = catVal.subCategory[SubID].subIsEnable;
          var packageDelivery = catVal.subCategory[SubID].packageDelivery;
          var priceSelection = catVal.subCategory[SubID].priceSelection;
          var roadPickupPriceSelection =
            catVal.subCategory[SubID].roadPickupPriceSelection;

          for (
            var j = 0;
            j < catVal.subCategory[SubID].roadPickupPriceSelection.length;
            j++
          ) {
            //console.log(req.body.districtName)
            if (
              catVal.subCategory[SubID].roadPickupPriceSelection[j]
                .districtName === req.body.districtName
            ) {
              //check the district name already exit
              // catVal.subCategory[SubID].priceSelection.splice(j,1);
              checkBoolN = true;
              catVal.subCategory[SubID].roadPickupPriceSelection.splice(j, 1);
            }
          }
          catVal.subCategory.splice(SubID, 1);

          if (checkBoolN) {
            // ################################  sub categoryNew array  ################################

            var subCategoryNew = [];

            subCategoryNew.push({
              subCategoryName: subCategoryName,
              subCategoryNo: subCategoryNo,
              tripSendDriversCount: tripSendDriversCount,
              higherBidTripChanceCount: higherBidTripChanceCount,
              subCategorySkippingCount: subCategorySkippingCount,
              passengerCount: passengerCount,
              driverTripTimerSecoends: driverTripTimerSecoends,
              subCategoryIcon: subCategoryIcon,
              subCategoryIconSelected: subCategoryIconSelected,
              mapIcon: mapIcon,
              mapIconOffline: mapIconOffline,
              mapIconOntrip: mapIconOntrip,
              vehicles: vehicles,
              priceSelection: priceSelection,
              roadPickupPriceSelection: roadPickupPriceSelection,
              subDescription: subDescription,
              subIsEnable: subIsEnable,
              packageDelivery: packageDelivery,
            });

            var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

            var newValues = {
              $set: {
                subCategory: subCategoryNewn,
              },
            };

            VehicleCategory.findByIdAndUpdate(
              editID,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  VehicleCategory.findById(editID).exec(function (err, user) {
                    if (err) {
                      console.log("error occured");
                    } else {
                      res.json({
                        message: "success",
                        details:
                          "Road pickup price selection delete successfully",
                        content: user,
                      });
                    }
                  });
                }
              }
            );
          } else {
            res.json({
              message: "failed",
              details: "This district name is exits !",
              status: "district_name_not_exited",
            });
          }
        } else {
          res.json({
            message: "failed",
            details: "This subcategory name is not exits !",
            status: "subCategory_not_exited",
          });
        }
      }
    }
  });
};

/*exports.getCategoryAllDataTimeAndLocationBasedNew = function (req, res) {

  console.log("###### get Category ######");
  VehicleCategory.find({
      "isEnable": true
    })
    .exec(function (err, category) {
      if (err) {
        console.log('####### error occured' + err);
        res.status(400).send('error');
      } else {
        if (category == null) {
          res.status(400).json({
            message: 'failed',
            details: "No data found",
            status: "failed"
          });
        } else {

          if (req.body.date && req.body.time) {
            console.log('got send time');
            var date = req.body.date + 'T' + req.body.time + '.000Z';
            var timeNow = new Date(date)
            console.log('###### time #### ', timeNow);
            var mins = parseInt(timeNow.getHours()) * 60 + parseInt(timeNow.getMinutes());
            console.log('###### time #### ', timeNow.getHours(), ' : ', timeNow.getMinutes() + ' => ' + mins);
          } else {
            var timeNow = new Date
            console.log('###### time #### ', timeNow);

            var mins = parseInt(timeNow.getHours()) * 60 + parseInt(timeNow.getMinutes()) + 330
            console.log('###### time #### ', timeNow.getHours(), ' : ', timeNow.getMinutes() + ' => ' + mins);
          }


          // geocoder.reverse({lat:req.body.latitude, lon:req.body.longitude}, function(err, resp) {
          geocoder.geocode(req.body.address, function (err, resp) {
            console.log('****** district ****** ', resp);
            var district = resp[0].administrativeLevels.level2long;

            var responseData = [];
            var categoryObj = {};

            // sort category
            category.sort((el1, el2) => {

              if (el1.categoryNo < el2.categoryNo)
                return -1;
              if (el1.categoryNo > el2.categoryNo)
                return 1;

            });

            category.forEach(element => {

              // sort sub category
              element.subCategory.forEach(element1 => {

                element.subCategory.sort((el1, el2) => {

                  if (el1.subCategoryNo < el2.subCategoryNo)
                    return -1;
                  if (el1.subCategoryNo > el2.subCategoryNo)
                    return 1;

                });

                let temp = element1.priceSelection.find(el => el.districtName == district)
                console.log('####### printing temp######')
                console.log(temp)
                //var defaultTimeBase = temp.timeBase[0];

                if (temp) {
                  var timeBaseSelected = {}

                  temp.timeBase.forEach(element2 => {

                    var start = parseInt(element2.startingTime.split(':')[0]) * 60 + parseInt(element2.startingTime.split(':')[1])
                    var end = parseInt(element2.endingTime.split(':')[0]) * 60 + parseInt(element2.endingTime.split(':')[1])

                    console.log(start + '------' + end)
                    console.log(element2);

                    if (start < end ) {

                      if (mins >= start && mins <= end) {
                        console.log('O');
                        // element1.lowerBidLimit = element2.lowerBidLimit
                        // element1.upperBidLimit = element2.upperBidLimit
                        // element1.roadPickupPriceSelection = [];
                        // element1.priceSelection = element1.priceSelection.filter(el => el.districtName == district);
                        // element1.priceSelection[0].timeBase= [];
                        // element1.priceSelection[0].timeBase.push(element2);
                        categoryObj.categoryTag = element.categoryName;
                        categoryObj.packageDelivery = element1.packageDelivery;
                        categoryObj.subDescription = element1.subDescription;
                        categoryObj.subCategoryName
                        categoryObj._id =
                        categoryObj.mapIcon =
                        categoryObj.subCategoryIconSelected =
                        categoryObj.subCategoryIcon =
                        categoryObj.isEnable =
                      }
                    } else {
                      console.log('N');

                      if (mins >= start && mins >= end) {
                        element1.lowerBidLimit = element2.lowerBidLimit
                        element1.upperBidLimit = element2.upperBidLimit
                        element1.roadPickupPriceSelection = [];
                        element1.priceSelection = element1.priceSelection.filter(el => el.districtName == district);
                        element1.priceSelection[0].timeBase= [];
                        element1.priceSelection[0].timeBase.push(element2);
                      }
                    }
                    console.log('### printing element2 ##########')
                console.log(element2);

                  });
                }
                console.log('### printing element1')
                console.log(element1);
                element1.categoryTag = element.categoryName
                //element1.priceSelection = [];
                responseData.push(element1);
              });
            });

            // responseData.sort((el1, el2) => {

            //   if (el1.lowerBidLimit < el2.lowerBidLimit)
            //     return -1;
            //   if (el1.lowerBidLimit > el2.lowerBidLimit)
            //     return 1;

            // });


            res.json({
              message: 'success',
              details: "get category data Successfully",
              content: responseData
            });
          });
        }
      }
    });

};*/
