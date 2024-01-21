var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var app = express();
var vehicleCategorydb = require("../models/vehicleCategorydb");
var bodyParser = require("body-parser");
const makeDir = require("make-dir");
const directoryExists = require("directory-exists");
var file = require("file-system");
var fs = require("fs");

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

///////////////////////////////////////////// vehicle Category Add  ////////////////////////////////////////////////
/* ### vehicle Category   ### */
exports.vehicleCatAdd = function (req, res) {
  console.log("###### vehicle Category add ######");
  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryObj.categoryName })
    .exec(function (err, catVal) {
      if (err) {
        console.log("error occured");
      } else {
        if (catVal !== null) {
          res.json({
            message: "failed",
            details: "This Category Name is Allready defined Plz Update !",
            status: "adding_failed",
          });
        } else {
          //Backend default value
          var datetime = new Date();
          var flgVal = "1";

          var VehicleCategorydb = new vehicleCategorydb();

          var con = req.body.categoryObj;

          VehicleCategorydb.categoryName = con.categoryName;

          VehicleCategorydb.description = con.description;
          VehicleCategorydb.isEnable = con.isEnable;

          VehicleCategorydb.flag = flgVal;
          VehicleCategorydb.recordedDateTime = datetime;

          var subCategory = [];

          for (var i = 0; i < con.subCategory.length; i++) {
            var vehicles = [];
            var priceSelection = [];
            var timeBase = [];

            var roadPickupPriceSelection = [];
            var roadPickupTimeBase = [];

            for (var j = 0; j < con.subCategory[i].vehicles.length; j++) {
              // ################################  vehicles array  ################################
              vehicles.push({
                vehicleBrand: con.subCategory[i].vehicles[j].vehicleBrand,
                vehicleName: con.subCategory[i].vehicles[j].vehicleName,
                vehicleClass: con.subCategory[i].vehicles[j].vehicleClass,
                modelType: con.subCategory[i].vehicles[j].modelType,
                modelCapacity: con.subCategory[i].vehicles[j].modelCapacity,
                vehiclePassengerCount:
                  con.subCategory[i].vehicles[j].vehiclePassengerCount,
                vehicleCapacityWeightLimit:
                  con.subCategory[i].vehicles[j].vehicleCapacityWeightLimit,
                "commission.adminCommission":
                  con.subCategory[i].vehicles[j].adminCommission,
                "commission.companyCommission":
                  con.subCategory[i].vehicles[j].companyCommission,
              });
            }

            for (var k = 0; k < con.subCategory[i].priceSelection.length; k++) {
              // ################################  price Selection array  ################################

              for (
                var p = 0;
                p < con.subCategory[i].priceSelection[k].timeBase.length;
                p++
              ) {
                timeBase.push({
                  timeSlotName:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .timeSlotName,
                  startingTime:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .startingTime,
                  endingTime:
                    con.subCategory[i].priceSelection[k].timeBase[p].endingTime,
                  districtPrice:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .districtPrice,
                  baseFare:
                    con.subCategory[i].priceSelection[k].timeBase[p].baseFare,
                  minimumFare:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .minimumFare,
                  minimumKM:
                    con.subCategory[i].priceSelection[k].timeBase[p].minimumKM,
                  belowAboveKMRange:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .belowAboveKMRange,
                  aboveKMFare:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .aboveKMFare,
                  belowKMFare:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .belowKMFare,
                  trafficWaitingChargePerMinute:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .trafficWaitingChargePerMinute,
                  normalWaitingChargePerMinute:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .normalWaitingChargePerMinute,
                  radius:
                    con.subCategory[i].priceSelection[k].timeBase[p].radius,
                  packageDeliveryKMPerHour:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .packageDeliveryKMPerHour,
                  packageDeliveryKMPerDay:
                    con.subCategory[i].priceSelection[k].timeBase[p]
                      .packageDeliveryKMPerDay,
                });
              }

              priceSelection.push({
                districtName: con.subCategory[i].priceSelection[k].districtName,
                timeBase: timeBase,
              });
              var timeBase = [];
            }

            for (
              var r = 0;
              r < con.subCategory[i].roadPickupPriceSelection.length;
              r++
            ) {
              // ################################  road Pickup Price Selection array  ################################

              for (
                var n = 0;
                n <
                con.subCategory[i].roadPickupPriceSelection[r].timeBase.length;
                n++
              ) {
                roadPickupTimeBase.push({
                  timeSlotName:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .timeSlotName,
                  startingTime:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .startingTime,
                  endingTime:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .endingTime,
                  districtPrice:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .districtPrice,
                  baseFare:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .baseFare,
                  minimumFare:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .minimumFare,
                  minimumKM:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .minimumKM,
                  belowAboveKMRange:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .belowAboveKMRange,
                  aboveKMFare:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .aboveKMFare,
                  belowKMFare:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .belowKMFare,
                  trafficWaitingChargePerMinute:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .trafficWaitingChargePerMinute,
                  normalWaitingChargePerMinute:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .normalWaitingChargePerMinute,
                  radius:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .radius,
                  packageDeliveryKMPerHour:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .packageDeliveryKMPerHour,
                  packageDeliveryKMPerDay:
                    con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                      .packageDeliveryKMPerDay,
                });
              }

              roadPickupPriceSelection.push({
                districtName:
                  con.subCategory[i].roadPickupPriceSelection[r].districtName,
                timeBase: roadPickupTimeBase,
              });
              var roadPickupTimeBase = [];
            }

            // ################################  subCategory array  ################################

            subCategory.push({
              subCategoryName: con.subCategory[i].subCategoryName,
              subCategoryIcon: null,
              subCategoryIconSelected: null,
              mapIcon: null,
              vehicles: vehicles,
              priceSelection: priceSelection,
              roadPickupPriceSelection: roadPickupPriceSelection,
              subDescription: con.subCategory[i].subDescription,
              subIsEnable: con.subCategory[i].subIsEnable,
              packageDelivery: con.subCategory[i].packageDelivery,
            });
          }

          VehicleCategorydb.subCategory = subCategory;

          VehicleCategorydb.save(function (err) {
            if (err) {
              console.log("error occured");
            } else {
              // user.password = undefined;
              res.json({
                message: "success",
                details: "Successfully add Vehicle Category",
                content: VehicleCategorydb,
              });
            }
          });
        }
      }
    });
};

///////////////////////////////////////////// vehicle Category Delete ////////////////////////////////////////////////

exports.vehicleCatDelete = function (req, res) {
  console.log("###### vehicle Category Delete ######");

  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, data) {
      if (err) {
        console.log("error occured");
      } else {
        if (data !== null) {
          vehicleCategorydb.remove(
            { categoryName: req.body.categoryName },
            function (err) {
              if (err) throw err;
              res.json({
                message: "success",
                details: "Successfully delete !!",
              });
            }
          );
        } else {
          res.json({
            message: "failed",
            details: "This Vehicle Categor not exists",
            status: "category_not_exited",
          });
        }
      }
    });
};

///////////////////////////////////////////// vehicle Category Add sub category  ////////////////////////////////////////////////
/* ### vehicle Category   ### */
exports.vehicleSubCatAdd = function (req, res) {
  console.log("###### vehicle Category Add sub category ######");

  vehicleCategorydb
    .findOne({ categoryName: req.body.subCategoryObj.categoryName })
    .exec(function (err, catVal) {
      if (err) {
        console.log("error occured");
      } else {
        if (catVal == null) {
          res.json({
            message: "failed",
            details: "this category name is not defined  !",
            status: "adding_failed",
          });
        } else {
          var editID = catVal._id;

          var checkBool = false;

          for (var i = 0; i < catVal.subCategory.length; i++) {
            for (
              var p = 0;
              p < req.body.subCategoryObj.subCategory.length;
              p++
            ) {
              if (
                catVal.subCategory[i].subCategoryName ===
                req.body.subCategoryObj.subCategory[p].subCategoryName
              ) {
                //check the sub category name already exit
                checkBool = true;
              }
            }
          }

          if (!checkBool) {
            var subCategoryNew = [];

            var con = req.body.subCategoryObj;

            for (var i = 0; i < con.subCategory.length; i++) {
              var vehiclesNew = [];
              var priceSelectionNew = [];
              var roadPickupPriceSelectionNew = [];
              var timeBaseNew = [];
              var roadPickupTimeBaseNew = [];

              for (var j = 0; j < con.subCategory[i].vehicles.length; j++) {
                // ################################  vehicles array  ################################
                vehiclesNew.push({
                  vehicleBrand: con.subCategory[i].vehicles[j].vehicleBrand,
                  vehicleName: con.subCategory[i].vehicles[j].vehicleName,
                  vehicleClass: con.subCategory[i].vehicles[j].vehicleClass,
                  modelType: con.subCategory[i].vehicles[j].modelType,
                  modelCapacity: con.subCategory[i].vehicles[j].modelCapacity,
                  vehiclePassengerCount:
                    con.subCategory[i].vehicles[j].vehiclePassengerCount,
                  vehicleCapacityWeightLimit:
                    con.subCategory[i].vehicles[j].vehicleCapacityWeightLimit,
                  "commission.adminCommission":
                    con.subCategory[i].vehicles[j].adminCommission,
                  "commission.companyCommission":
                    con.subCategory[i].vehicles[j].companyCommission,
                });
              }

              for (
                var k = 0;
                k < con.subCategory[i].priceSelection.length;
                k++
              ) {
                // ################################  price Selection array  ################################

                for (
                  var p = 0;
                  p < con.subCategory[i].priceSelection[k].timeBase.length;
                  p++
                ) {
                  timeBaseNew.push({
                    timeSlotName:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .timeSlotName,
                    startingTime:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .startingTime,
                    endingTime:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .endingTime,
                    districtPrice:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .districtPrice,
                    baseFare:
                      con.subCategory[i].priceSelection[k].timeBase[p].baseFare,
                    minimumFare:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .minimumFare,
                    minimumKM:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .minimumKM,
                    belowAboveKMRange:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .belowAboveKMRange,
                    aboveKMFare:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .aboveKMFare,
                    belowKMFare:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .belowKMFare,
                    trafficWaitingChargePerMinute:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .trafficWaitingChargePerMinute,
                    normalWaitingChargePerMinute:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .normalWaitingChargePerMinute,
                    radius:
                      con.subCategory[i].priceSelection[k].timeBase[p].radius,
                    packageDeliveryKMPerHour:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .packageDeliveryKMPerHour,
                    packageDeliveryKMPerDay:
                      con.subCategory[i].priceSelection[k].timeBase[p]
                        .packageDeliveryKMPerDay,
                  });
                }

                priceSelectionNew.push({
                  districtName:
                    con.subCategory[i].priceSelection[k].districtName,
                  timeBase: timeBaseNew,
                });
                var timeBaseNew = [];
              }

              for (
                var r = 0;
                r < con.subCategory[i].roadPickupPriceSelection.length;
                r++
              ) {
                // ################################  price Selection array  ################################

                for (
                  var n = 0;
                  n <
                  con.subCategory[i].roadPickupPriceSelection[r].timeBase
                    .length;
                  n++
                ) {
                  roadPickupTimeBaseNew.push({
                    timeSlotName:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .timeSlotName,
                    startingTime:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .startingTime,
                    endingTime:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .endingTime,
                    districtPrice:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .districtPrice,
                    baseFare:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .baseFare,
                    minimumFare:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .minimumFare,
                    minimumKM:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .minimumKM,
                    belowAboveKMRange:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .belowAboveKMRange,
                    aboveKMFare:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .aboveKMFare,
                    belowKMFare:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .belowKMFare,
                    trafficWaitingChargePerMinute:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .trafficWaitingChargePerMinute,
                    normalWaitingChargePerMinute:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .normalWaitingChargePerMinute,
                    radius:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .radius,
                    packageDeliveryKMPerHour:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .packageDeliveryKMPerHour,
                    packageDeliveryKMPerDay:
                      con.subCategory[i].roadPickupPriceSelection[r].timeBase[n]
                        .packageDeliveryKMPerDay,
                  });
                }

                roadPickupPriceSelectionNew.push({
                  districtName:
                    con.subCategory[i].roadPickupPriceSelection[r].districtName,
                  timeBase: roadPickupTimeBaseNew,
                });
                var roadPickupTimeBaseNew = [];
              }

              // ################################  subCategory array  ################################

              subCategoryNew.push({
                subCategoryName: con.subCategory[i].subCategoryName,
                subCategoryIcon: null,
                subCategoryIconSelected: null,
                mapIcon: null,
                vehicles: vehiclesNew,
                priceSelection: priceSelectionNew,
                roadPickupPriceSelection: roadPickupPriceSelectionNew,
                subDescription: con.subCategory[i].subDescription,
                subIsEnable: con.subCategory[i].subIsEnable,
                packageDelivery: con.subCategory[i].packageDelivery,
              });
            }

            var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

            console.log(subCategoryNewn);

            var newValues = {
              $set: {
                subCategory: subCategoryNewn,
              },
            };

            vehicleCategorydb.findByIdAndUpdate(
              editID,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  vehicleCategorydb.findById(editID).exec(function (err, user) {
                    if (err) {
                      console.log("error occured");
                    } else {
                      res.json({
                        message: "success",
                        details: "subcategory add successfully",
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
              details: "this subcategory name is exits !",
              status: "adding_failed",
            });
          }
        }
      }
    });
};

///////////////////////////////////////////// vehicle Category --> sub category add  price selection  ////////////////////////////////////////////////

exports.vehicleSubCatAddPrSe = function (req, res) {
  console.log("###### vehicle Category Add sub category ######");

  vehicleCategorydb
    .findOne({ categoryName: req.body.priceSelectionObj.categoryName })
    .exec(function (err, catVal) {
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
            var mapIcon = catVal.subCategory[SubID].mapIcon;
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

                for (
                  var p = 0;
                  p < Obj.priceSelection[q].timeBase.length;
                  p++
                ) {
                  timeBaseNew.push({
                    timeSlotName:
                      Obj.priceSelection[q].timeBase[p].timeSlotName,
                    startingTime:
                      Obj.priceSelection[q].timeBase[p].startingTime,
                    endingTime: Obj.priceSelection[q].timeBase[p].endingTime,
                    districtPrice:
                      Obj.priceSelection[q].timeBase[p].districtPrice,
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
                      Obj.priceSelection[q].timeBase[p]
                        .packageDeliveryKMPerHour,
                    packageDeliveryKMPerDay:
                      Obj.priceSelection[q].timeBase[p].packageDeliveryKMPerDay,
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
                mapIcon: mapIcon,
                vehicles: vehicles,
                priceSelection: priceSelectionNewn,
                roadPickupPriceSelection: roadPickupPriceSelection,
                subDescription: subDescription,
                subIsEnable: subIsEnable,
                packageDelivery: packageDelivery,
              });

              subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

              console.log(subCategoryNewn);

              var newValues = {
                $set: {
                  subCategory: subCategoryNewn,
                },
              };

              vehicleCategorydb.findByIdAndUpdate(
                editID,
                newValues,
                function (err, result) {
                  if (err) {
                    console.log("error occured");
                    throw err;
                  } else {
                    vehicleCategorydb
                      .findById(editID)
                      .exec(function (err, user) {
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

///////////////////////////////////////////// vehicle Category --> sub category upadte  price selection   ////////////////////////////////////////////////

exports.vehicleSubCatUpdPrSe = function (req, res) {
  console.log("###### vehicle Category Add sub category ######");

  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, catVal) {
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
            var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
            var subCategoryIconSelected =
              catVal.subCategory[SubID].subCategoryIconSelected;
            var mapIcon = catVal.subCategory[SubID].mapIcon;
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
              for (
                var u = 0;
                u <
                catVal.subCategory[SubID].priceSelection[pricID].timeBase
                  .length;
                u++
              ) {
                if (
                  catVal.subCategory[SubID].priceSelection[pricID].timeBase[u]
                    .timeSlotName === req.body.timeSlotName
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
                catVal.subCategory[SubID].priceSelection.splice(pricID, 1);
                catVal.subCategory.splice(SubID, 1);

                // ################################  price Selection array  ################################

                timeBaseNew.push({
                  timeSlotName: req.body.timeSlotName,
                  startingTime: req.body.startingTime,
                  endingTime: req.body.endingTime,
                  districtPrice: req.body.districtPrice,
                  baseFare: req.body.baseFare,
                  minimumFare: req.body.minimumFare,
                  minimumKM: req.body.minimumKM,
                  belowAboveKMRange: req.body.belowAboveKMRange,
                  aboveKMFare: req.body.aboveKMFare,
                  belowKMFare: req.body.belowKMFare,
                  trafficWaitingChargePerMinute:
                    req.body.trafficWaitingChargePerMinute,
                  normalWaitingChargePerMinute:
                    req.body.normalWaitingChargePerMinute,
                  radius: req.body.radius,
                  packageDeliveryKMPerHour: req.body.packageDeliveryKMPerHour,
                  packageDeliveryKMPerDay: req.body.packageDeliveryKMPerDay,
                });

                var priceSelectionNew = [];
                priceSelectionNew.push({
                  districtName: req.body.districtName,
                  timeBase: timeBaseNew,
                });

                var priceSelectionNewn =
                  priceSelectionNew.concat(priceSelection);

                var subCategoryNew = [];

                subCategoryNew.push({
                  subCategoryName: subCategoryName,
                  subCategoryIcon: subCategoryIcon,
                  subCategoryIconSelected: subCategoryIconSelected,
                  mapIcon: mapIcon,
                  vehicles: vehicles,
                  priceSelection: priceSelectionNewn,
                  roadPickupPriceSelection: roadPickupPriceSelection,
                  subDescription: subDescription,
                  subIsEnable: subIsEnable,
                  packageDelivery: packageDelivery,
                });

                subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

                var newValues = {
                  $set: {
                    subCategory: subCategoryNewn,
                  },
                };

                vehicleCategorydb.findByIdAndUpdate(
                  editID,
                  newValues,
                  function (err, result) {
                    if (err) {
                      console.log("error occured");
                      throw err;
                    } else {
                      vehicleCategorydb
                        .findById(editID)
                        .exec(function (err, user) {
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

///////////////////////////////////////////// vehicle Category Details ////////////////////////////////////////////////

// User Booking Details
exports.vehicleCatDetails = function (req, res, next) {
  vehicleCategorydb.find({}, function (err, result) {
    if (err) throw err;
    //console.log(doc)
    if (result !== null) {
      res.json({
        message: "success",
        details: "vehicle category  deatils",
        status: "success_failed",
        content: result,
      });
    } else {
      res.json({
        message: "failed",
        details: "vehicle category no deatils ",
        status: "data_failed",
      });
    }
  });
};

/////////////////////////////////////////////  vehicle Category -> sub Category delete  ////////////////////////////////////////////////

exports.vehicleSubCatDel = function (req, res) {
  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, catVal) {
      if (err) {
        console.log("error occured");
        res.json({
          message: "failed",
          details: "This Category Name is not defined",
          status: "user_not_exited",
        });
      } else {
        if (catVal !== null) {
          // %%%%%%%%%%%%%%%%%% checK the exits in driverdb %%%%%%%%%%%%%%%%%%

          var editID = catVal._id;

          var checkBool = false;

          // var subCategorydb = catVal.subCategory;

          for (var i = 0; i < catVal.subCategory.length; i++) {
            if (
              catVal.subCategory[i].subCategoryName === req.body.subCategoryName
            ) {
              //check the panel Name already exit
              checkBool = true;
              catVal.subCategory.splice(i, 1);
            }
          }

          var subCategorydbNew = catVal.subCategory;

          if (checkBool) {
            var newValues = {
              $set: {
                subCategory: subCategorydbNew,
              },
            };

            vehicleCategorydb.findByIdAndUpdate(
              editID,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  vehicleCategorydb.findById(editID).exec(function (err, user) {
                    if (err) {
                      console.log("error occured");
                    } else {
                      res.json({
                        message: "success",
                        details: "sub category delete successfully",
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
              details: "sub category not exists ",
              status: "subCategory_not_exited",
            });
          }
        } else {
          res.json({
            message: "failed",
            details: "category Name is not defined",
            status: "category_not_exited",
          });
        }
      }
    });
};

///////////////////////////////////////////// vehicle Category --> sub category delete  price selection  ////////////////////////////////////////////////

exports.vehicleSubCatDelPrSe = function (req, res) {
  console.log("###### vehicle Category Add sub category ######");

  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, catVal) {
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
                subCategoryIcon: subCategoryIcon,
                subCategoryIconSelected: subCategoryIconSelected,
                mapIcon: mapIcon,
                vehicles: vehicles,
                priceSelection: priceSelection,
                roadPickupPriceSelection: roadPickupPriceSelection,
                subDescription: subDescription,
                subIsEnable: subIsEnable,
                packageDelivery: packageDelivery,
              });

              subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

              var newValues = {
                $set: {
                  subCategory: subCategoryNewn,
                },
              };

              vehicleCategorydb.findByIdAndUpdate(
                editID,
                newValues,
                function (err, result) {
                  if (err) {
                    console.log("error occured");
                    throw err;
                  } else {
                    vehicleCategorydb
                      .findById(editID)
                      .exec(function (err, user) {
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

///////////////////////////////////////////// vehicle Category edit --> sub category update  ////////////////////////////////////////////////

exports.vehicleSubCatUpd = function (req, res) {
  console.log("###### vehicle Category update sub category ######");

  var subCategoryUpdateObj = req.body.subCategoryUpdateObj;

  vehicleCategorydb
    .findOne({ categoryName: subCategoryUpdateObj.categoryName })
    .exec(function (err, catVal) {
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
            if (
              catVal.subCategory[i].subCategoryName ===
              subCategoryUpdateObj.subCategory.subCategoryName
            ) {
              //check the sub category name already exit
              checkBool = true;
              var SubID = i;

              var subCategoryIconNew =
                catVal.subCategory[SubID].subCategoryIcon;
              var subCategoryIconSelectedNew =
                catVal.subCategory[SubID].subCategoryIconSelected;
              var mapIconNew = catVal.subCategory[SubID].mapIcon;
              var subCategoryNameNew =
                catVal.subCategory[SubID].subCategoryName;
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
              subCategoryName: subCategoryNameNew,
              subCategoryIcon: subCategoryIconNew,
              subCategoryIconSelected: subCategoryIconSelectedNew,
              mapIcon: mapIconNew,
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

            vehicleCategorydb.findByIdAndUpdate(
              editID,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  vehicleCategorydb.findById(editID).exec(function (err, user) {
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

///////////////////////////////////////////// vehicle Category edit  ////////////////////////////////////////////////

exports.vehicleCatUpd = function (req, res) {
  console.log("###### vehicle Category update  ######");

  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, catVal) {
      if (err) {
        console.log("error occured");
      } else {
        if (catVal == null) {
          res.json({
            message: "failed",
            details: "this category name is not defined  !",
            status: "category_not_exited",
          });
        } else {
          var editID = catVal._id;

          var newValues = {
            $set: {
              description: req.body.description,
              isEnable: req.body.isEnable,
            },
          };

          vehicleCategorydb.findByIdAndUpdate(
            editID,
            newValues,
            function (err, result) {
              if (err) {
                console.log("error occured");
                throw err;
              } else {
                vehicleCategorydb.findById(editID).exec(function (err, user) {
                  if (err) {
                    console.log("error occured");
                    console.log(err);
                  } else {
                    res.json({
                      message: "success",
                      details: "vehicle category update successfully",
                      content: user,
                    });
                  }
                });
              }
            }
          );
        }
      }
    });
};

///////////////////////////////////////////// vehicle Category || subCategory Icon file upload  ////////////////////////////////////////////////

exports.vehicleCatsubCatIonUp = function (req, res) {
  console.log(
    "###### vehicle Category subCategory Icon file upload update  ######",
    req.body.vehicleCategory
  );

  vehicleCategorydb
    .findOne({ categoryName: req.body.vehicleCategory })
    .exec(function (err, Catval) {
      if (err) {
        console.log("error occured");
        res.json({
          message: "failed",
          details: "category name does not exists",
          status: "categoryName_not_exited",
        });
      } else {
        if (Catval !== null) {
          var checkBool = false;

          for (var i = 0; i < Catval.subCategory.length; i++) {
            if (
              Catval.subCategory[i].subCategoryName === req.body.subCategoryName
            ) {
              //check the sub category name already exit
              checkBool = true;

              var subCategoryNamePa = Catval.subCategory[i].subCategoryName;
              var vehiclesPa = Catval.subCategory[i].vehicles;
              var priceSelectionPa = Catval.subCategory[i].priceSelection;
              var subDescriptionPa = Catval.subCategory[i].subDescription;
              var subIsEnablePa = Catval.subCategory[i].subIsEnable;
              var packageDeliveryPa = Catval.subCategory[i].packageDelivery;
              var roadPickupPriceSelectionPa =
                Catval.subCategory[i].roadPickupPriceSelection;

              Catval.subCategory.splice(i, 1);
            }
          }

          if (checkBool) {
            var directory =
              "/public/upload/vehicleCategory/" +
              String(Catval._id) +
              "/" +
              String(subCategoryNamePa);
            directoryExists(directory, (error, result) => {
              //console.log(result); // result is a boolean

              if (!result) {
                makeDir(directory).then((path) => {
                  //console.log(path);
                  //=> '/Users/sindresorhus/fun/unicorn/rainbow/cake'
                });
              }
            });

            if (req.files) {
              var file = req.files.subCategoryIcon,
                filenamesubCategoryIcon = file.name;
              //company Pic document upload
              file.mv(
                "/public/upload/vehicleCategory/" +
                  String(Catval._id) +
                  "/" +
                  String(subCategoryNamePa) +
                  "/" +
                  filenamesubCategoryIcon,
                function (err) {}
              );
              var filePathsubCategoryIcon =
                "upload/vehicleCategory/" +
                String(Catval._id) +
                "/" +
                String(subCategoryNamePa) +
                "/" +
                filenamesubCategoryIcon;
              subCategoryIconFile = filePathsubCategoryIcon;
            } else {
              subCategoryIconFile = null;
            }

            // subCategory Icon Selected file upload

            if (req.files) {
              var file = req.files.subCategoryIconSelected,
                filenamesubCategoryIconSelected = file.name;
              //company Pic document upload
              file.mv(
                "/public/upload/vehicleCategory/" +
                  String(Catval._id) +
                  "/" +
                  String(subCategoryNamePa) +
                  "/" +
                  filenamesubCategoryIconSelected,
                function (err) {}
              );
              var filePathsubCategoryIconSelected =
                "upload/vehicleCategory/" +
                String(Catval._id) +
                "/" +
                String(subCategoryNamePa) +
                "/" +
                filenamesubCategoryIconSelected;
              subCategoryIconSelectedFile = filePathsubCategoryIconSelected;
            } else {
              subCategoryIconSelectedFile = null;
            }

            //map Icon Selected file upload

            if (req.files) {
              var file = req.files.mapIcon,
                filenameMapIcon = file.name;
              //company Pic document upload
              file.mv(
                "/public/upload/vehicleCategory/" +
                  String(Catval._id) +
                  "/" +
                  String(subCategoryNamePa) +
                  "/" +
                  filenameMapIcon,
                function (err) {}
              );
              var filePathMapIcon =
                "upload/vehicleCategory/" +
                String(Catval._id) +
                "/" +
                String(subCategoryNamePa) +
                "/" +
                filenameMapIcon;
              filePathMapIconFile = filePathMapIcon;
            } else {
              filePathMapIconFile = null;
            }

            var subCategoryNew = [];
            subCategoryNew.push({
              subCategoryName: subCategoryNamePa,
              subCategoryIcon: subCategoryIconFile,
              subCategoryIconSelected: subCategoryIconSelectedFile,
              mapIcon: filePathMapIconFile,
              vehicles: vehiclesPa,
              priceSelection: priceSelectionPa,
              roadPickupPriceSelection: roadPickupPriceSelectionPa,
              subDescription: subDescriptionPa,
              subIsEnable: subIsEnablePa,
              packageDelivery: packageDeliveryPa,
            });

            var subCategoryNewn = subCategoryNew.concat(Catval.subCategory);

            var newValues = {
              $set: {
                subCategory: subCategoryNewn,
              },
            };

            vehicleCategorydb.findByIdAndUpdate(
              Catval._id,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  vehicleCategorydb
                    .findById(Catval._id)
                    .exec(function (err, user) {
                      if (err) {
                        console.log("error occured");
                      } else {
                        res.json({
                          message: "success",
                          details: "updated successfully",
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
                "sub category does not assign to the category (category not in the db)",
              status: "category_not_exited",
            });
          }
        } else {
          res.json({
            message: "failed",
            details: "category name does not exists",
            status: "categoryName_not_exited",
          });
        }
      }
    });
};

///////////////////////////////////////////// vehicle Category --> sub category add  price selection  ////////////////////////////////////////////////

exports.vehicleSubCatAddVeh = function (req, res) {
  console.log("###### vehicle Category Add  ######");

  vehicleCategorydb
    .findOne({ categoryName: req.body.vehicle.categoryName })
    .exec(function (err, catVal) {
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
            var vehicles = catVal.subCategory[SubID].vehicles;
            var subDescription = catVal.subCategory[SubID].subDescription;
            var subIsEnable = catVal.subCategory[SubID].subIsEnable;
            var packageDelivery = catVal.subCategory[SubID].packageDelivery;
            var priceSelection = catVal.subCategory[SubID].priceSelection;
            var roadPickupPriceSelection =
              catVal.subCategory[SubID].roadPickupPriceSelection;

            var vehiclesObj = req.body.vehicle;

            for (
              var j = 0;
              j < catVal.subCategory[SubID].vehicles.length;
              j++
            ) {
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
                vehicles: vehiclesNewn,
                priceSelection: priceSelection,
                roadPickupPriceSelection: roadPickupPriceSelection,
                subDescription: subDescription,
                subIsEnable: subIsEnable,
                packageDelivery: packageDelivery,
              });

              subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

              ///console.log(vehiclesNewn)

              var newValues = {
                $set: {
                  subCategory: subCategoryNewn,
                },
              };

              vehicleCategorydb.findByIdAndUpdate(
                catVal._id,
                newValues,
                function (err, result) {
                  if (err) {
                    console.log("error occured");
                    throw err;
                  } else {
                    vehicleCategorydb
                      .findById(catVal._id)
                      .exec(function (err, user) {
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

///////////////////////////////////////////// vehicle Category --> sub category upadte  vehicle   ////////////////////////////////////////////////

exports.vehicleSubCatUpdVeh = function (req, res) {
  console.log("###### vehicle Category upadte vehicle ######");
  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, catVal) {
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
            var vehicles = catVal.subCategory[SubID].vehicles;
            var subDescription = catVal.subCategory[SubID].subDescription;
            var subIsEnable = catVal.subCategory[SubID].subIsEnable;
            var packageDelivery = catVal.subCategory[SubID].packageDelivery;
            var priceSelection = catVal.subCategory[SubID].priceSelection;
            var roadPickupPriceSelection =
              catVal.subCategory[SubID].roadPickupPriceSelection;

            for (
              var j = 0;
              j < catVal.subCategory[SubID].vehicles.length;
              j++
            ) {
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
                vehicles: vehiclesNewn,
                priceSelection: priceSelection,
                roadPickupPriceSelection: roadPickupPriceSelection,
                subDescription: subDescription,
                subIsEnable: subIsEnable,
                packageDelivery: packageDelivery,
              });

              subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

              var newValues = {
                $set: {
                  subCategory: subCategoryNewn,
                },
              };

              vehicleCategorydb.findByIdAndUpdate(
                editID,
                newValues,
                function (err, result) {
                  if (err) {
                    console.log("error occured");
                    throw err;
                  } else {
                    vehicleCategorydb
                      .findById(editID)
                      .exec(function (err, user) {
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

///////////////////////////////////////////// vehicle Category --> sub category delete vehicle   ////////////////////////////////////////////////

exports.vehicleSubCatDelVeh = function (req, res) {
  console.log("###### vehicle Category delete vehicle ######");

  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, catVal) {
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
            var vehicles = catVal.subCategory[SubID].vehicles;
            var subDescription = catVal.subCategory[SubID].subDescription;
            var subIsEnable = catVal.subCategory[SubID].subIsEnable;
            var packageDelivery = catVal.subCategory[SubID].packageDelivery;
            var priceSelection = catVal.subCategory[SubID].priceSelection;
            var roadPickupPriceSelection =
              catVal.subCategory[SubID].roadPickupPriceSelection;

            for (
              var j = 0;
              j < catVal.subCategory[SubID].vehicles.length;
              j++
            ) {
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
                vehicles: vehicles,
                priceSelection: priceSelection,
                roadPickupPriceSelection: roadPickupPriceSelection,
                subDescription: subDescription,
                subIsEnable: subIsEnable,
                packageDelivery: packageDelivery,
              });

              subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

              var newValues = {
                $set: {
                  subCategory: subCategoryNewn,
                },
              };

              vehicleCategorydb.findByIdAndUpdate(
                editID,
                newValues,
                function (err, result) {
                  if (err) {
                    console.log("error occured");
                    throw err;
                  } else {
                    vehicleCategorydb
                      .findById(editID)
                      .exec(function (err, user) {
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

///////////////////////////////////////////// Category Enable/ Disable ////////////////////////////////////////////////

exports.categoryisEnable = function (req, res) {
  console.log("###### updating category  ######");
  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, user) {
      if (err) {
        console.log("error occured");
        res.json({
          message: "failed",
          details: "category Name is not defined !",
          status: "category_not_exited",
        });
      } else {
        if (user !== null) {
          var newValues = {
            $set: {
              isEnable: req.body.isEnable,
            },
          };
          vehicleCategorydb.findByIdAndUpdate(
            user._id,
            newValues,
            function (err, result) {
              if (err) {
                console.log("error occured");
                throw err;
              } else {
                vehicleCategorydb.findById(user._id).exec(function (err, user) {
                  if (err) {
                    console.log("error occured");
                  } else {
                    res.json({
                      message: "success",
                      details: "updated successfully",
                      content: "isEnable :" + user.isEnable,
                    });
                  }
                });
              }
            }
          );
        } else {
          res.json({
            message: "failed",
            details: "category name does not exists",
            status: "category_not_exited",
          });
        }
      }
    });
};

///////////////////////////////////////////// sub category Enable/ Disable ////////////////////////////////////////////////

exports.subcategoryisEnable = function (req, res) {
  console.log("###### updating sub category  ######");
  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, catVal) {
      if (err) {
        console.log("error occured");
        res.json({
          message: "failed",
          details: "category Name is not defined !",
          status: "category_not_exited",
        });
      } else {
        if (catVal !== null) {
          var checkBool = false;
          for (var i = 0; i < catVal.subCategory.length; i++) {
            if (
              catVal.subCategory[i].subCategoryName === req.body.subCategoryName
            ) {
              //check the panel Name already exit
              checkBool = true;

              var subCategoryName = catVal.subCategory[i].subCategoryName;
              var subCategoryIcon = catVal.subCategory[i].subCategoryIcon;
              var subCategoryIconSelected =
                catVal.subCategory[i].subCategoryIconSelected;
              var mapIcon = catVal.subCategory[i].mapIcon;
              var vehicles = catVal.subCategory[i].vehicles;
              var subDescription = catVal.subCategory[i].subDescription;
              var packageDelivery = catVal.subCategory[i].packageDelivery;
              var priceSelection = catVal.subCategory[i].priceSelection;
              var roadPickupPriceSelection =
                catVal.subCategory[i].roadPickupPriceSelection;

              // remove the sub category
              catVal.subCategory.splice(i, 1);
            }
          }
          if (checkBool) {
            var subCategoryNew = [];
            subCategoryNew.push({
              subCategoryName: subCategoryName,
              subCategoryIcon: subCategoryIcon,
              subCategoryIconSelected: subCategoryIconSelected,
              mapIcon: mapIcon,
              vehicles: vehicles,
              priceSelection: priceSelection,
              roadPickupPriceSelection: roadPickupPriceSelection,
              subDescription: subDescription,
              subIsEnable: req.body.subIsEnable,
              packageDelivery: packageDelivery,
            });

            var subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

            var newValues = {
              $set: {
                subCategory: subCategoryNewn,
              },
            };
            vehicleCategorydb.findByIdAndUpdate(
              catVal._id,
              newValues,
              function (err, result) {
                if (err) {
                  console.log("error occured");
                  throw err;
                } else {
                  vehicleCategorydb
                    .findById(catVal._id)
                    .exec(function (err, user) {
                      if (err) {
                        console.log("error occured");
                      } else {
                        res.json({
                          message: "success",
                          details: "updated successfully",
                          content: "subIsEnable :" + req.body.subIsEnable,
                        });
                      }
                    });
                }
              }
            );
          } else {
            res.json({
              message: "failed",
              details: "this sub category name is not exits !",
              status: "subCategory_not_exited",
            });
          }
        } else {
          res.json({
            message: "failed",
            details: "category name does not exists",
            status: "category_not_exited",
          });
        }
      }
    });
};

///////////////////////////////////////////// vehicle Category --> sub category add road pickup price selection  ////////////////////////////////////////////////

exports.vehicleSubCatAddRodPick = function (req, res) {
  console.log("###### vehicle Category Ad road Pickup Price Selection ######");
  vehicleCategorydb
    .findOne({
      categoryName: req.body.roadPickupPriceSelectionObj.categoryName,
    })
    .exec(function (err, catVal) {
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
            var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
            var subCategoryIconSelected =
              catVal.subCategory[SubID].subCategoryIconSelected;
            var mapIcon = catVal.subCategory[SubID].mapIcon;
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
                    .districtName ===
                  Obj.roadPickupPriceSelection[p].districtName
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
                subCategoryIcon: subCategoryIcon,
                subCategoryIconSelected: subCategoryIconSelected,
                mapIcon: mapIcon,
                vehicles: vehicles,
                priceSelection: priceSelection,
                roadPickupPriceSelection: roadPickupPriceSelectionNewn,
                subDescription: subDescription,
                subIsEnable: subIsEnable,
                packageDelivery: packageDelivery,
              });

              subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

              var newValues = {
                $set: {
                  subCategory: subCategoryNewn,
                },
              };

              vehicleCategorydb.findByIdAndUpdate(
                editID,
                newValues,
                function (err, result) {
                  if (err) {
                    console.log("error occured");
                    throw err;
                  } else {
                    vehicleCategorydb
                      .findById(editID)
                      .exec(function (err, user) {
                        if (err) {
                          console.log("error occured");
                        } else {
                          res.json({
                            message: "success",
                            details:
                              "Road Pickup Price Selection add successfully",
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

///////////////////////////////////////////// vehicle Category --> sub category upadte  road pickup price selection   ////////////////////////////////////////////////

exports.vehicleSubCatUpRodPick = function (req, res) {
  console.log(
    "###### vehicle Category Add sub category  road pickup price selection ######"
  );
  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, catVal) {
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
            var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
            var subCategoryIconSelected =
              catVal.subCategory[SubID].subCategoryIconSelected;
            var mapIcon = catVal.subCategory[SubID].mapIcon;
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

                timeBaseNew.push({
                  timeSlotName: req.body.timeSlotName,
                  startingTime: req.body.startingTime,
                  endingTime: req.body.endingTime,
                  districtPrice: req.body.districtPrice,
                  baseFare: req.body.baseFare,
                  minimumFare: req.body.minimumFare,
                  minimumKM: req.body.minimumKM,
                  belowAboveKMRange: req.body.belowAboveKMRange,
                  aboveKMFare: req.body.aboveKMFare,
                  belowKMFare: req.body.belowKMFare,
                  trafficWaitingChargePerMinute:
                    req.body.trafficWaitingChargePerMinute,
                  normalWaitingChargePerMinute:
                    req.body.normalWaitingChargePerMinute,
                  radius: req.body.radius,
                  packageDeliveryKMPerHour: req.body.packageDeliveryKMPerHour,
                  packageDeliveryKMPerDay: req.body.packageDeliveryKMPerDay,
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
                  subCategoryIcon: subCategoryIcon,
                  subCategoryIconSelected: subCategoryIconSelected,
                  mapIcon: mapIcon,
                  vehicles: vehicles,
                  priceSelection: priceSelection,
                  roadPickupPriceSelection: roadPickupPriceSelectionNewn,
                  subDescription: subDescription,
                  subIsEnable: subIsEnable,
                  packageDelivery: packageDelivery,
                });

                subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

                var newValues = {
                  $set: {
                    subCategory: subCategoryNewn,
                  },
                };

                vehicleCategorydb.findByIdAndUpdate(
                  editID,
                  newValues,
                  function (err, result) {
                    if (err) {
                      console.log("error occured");
                      throw err;
                    } else {
                      vehicleCategorydb
                        .findById(editID)
                        .exec(function (err, user) {
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

///////////////////////////////////////////// vehicle Category --> sub category delete road pickup price selection  ////////////////////////////////////////////////

exports.vehicleSubCatDeRodPick = function (req, res) {
  console.log(
    "###### vehicle Category delete sub category road pickup price selection ######"
  );
  vehicleCategorydb
    .findOne({ categoryName: req.body.categoryName })
    .exec(function (err, catVal) {
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
                subCategoryIcon: subCategoryIcon,
                subCategoryIconSelected: subCategoryIconSelected,
                mapIcon: mapIcon,
                vehicles: vehicles,
                priceSelection: priceSelection,
                roadPickupPriceSelection: roadPickupPriceSelection,
                subDescription: subDescription,
                subIsEnable: subIsEnable,
                packageDelivery: packageDelivery,
              });

              subCategoryNewn = subCategoryNew.concat(catVal.subCategory);

              var newValues = {
                $set: {
                  subCategory: subCategoryNewn,
                },
              };

              vehicleCategorydb.findByIdAndUpdate(
                editID,
                newValues,
                function (err, result) {
                  if (err) {
                    console.log("error occured");
                    throw err;
                  } else {
                    vehicleCategorydb
                      .findById(editID)
                      .exec(function (err, user) {
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

///////////////////////////////////////////// vehicle Category  --> sub category get icons  ////////////////////////////////////////////////

exports.vehicleCategoryGetIcons = function (req, res) {
  console.log("###### vehicle Category get sub category icons ######");

  var categoryGetIconsObj = req.body.categoryGetIconsObj;

  vehicleCategorydb
    .findOne({ categoryName: categoryGetIconsObj.categoryName })
    .exec(function (err, catVal) {
      if (err) {
        console.log("error occured");
      } else {
        if (catVal == null) {
          res.json({
            message: "failed",
            details: "this category name is not defined  !",
            status: "data_failed",
          });
        } else {
          var checkBool = false;

          var iconArray = [];

          for (var i = 0; i < catVal.subCategory.length; i++) {
            if (
              catVal.subCategory[i].subCategoryName ===
              categoryGetIconsObj.subCategory.subCategoryName
            ) {
              //check the sub category name already exit
              checkBool = true;
              var SubID = i;
              var subCategoryName = catVal.subCategory[SubID].subCategoryName;
              var subCategoryIcon = catVal.subCategory[SubID].subCategoryIcon;
              var subCategoryIconSelected =
                catVal.subCategory[SubID].subCategoryIconSelected;
              var mapIcon = catVal.subCategory[SubID].mapIcon;

              iconArray.push({
                subCategoryIcon: subCategoryIcon,
                subCategoryIconSelected: subCategoryIconSelected,
                mapIcon: mapIcon,
              });
            }
          }

          if (checkBool) {
            if (subCategoryIcon !== null || subCategoryIconSelected !== null) {
              res.json({
                message: "success",
                details:
                  "sub Category icon and sub Category icon Selected deatils",
                status: "success_data",
                content: iconArray,
              });
            } else {
              res.json({
                message: "failed",
                details:
                  "sub Category icon and sub Category icon Selected is null plz add the icon to the subcategory !",
                status: "data_failed",
              });
            }
          } else {
            res.json({
              message: "failed",
              details:
                "This subcategory name is not exits plz add the subcategory !",
              status: "data_failed",
            });
          }
        }
      }
    });
};

// exports.addVehicle = function (req, res) {
//   console.log(req.body)
//   console.log(req.body.categoryObj.subCategory);

//   VehicleCategory.findOne({ 'categoryName': req.body.categoryObj.categoryName })
//     .exec(function (err, data) {
//       if (err) {
//         console.log('####### error occured' + err);
//         res.status(400).send('error');
//       } else {
//         if (data == null) {
//           res.status(400).json({ message: 'failed', details: "category not registered!", status: "failed" });
//         } else {
//           var vehicleCategory = new VehicleCategory();

//           var tempSubCat = {
//             vehicles: []
//           }

//           VehicleCategory.find({ 'categoryName': req.body.categoryObj.categoryName })
//             .exec(function (err, category) {
//               if (err) {
//                 console.log('####### error occured' + err);
//                 res.status(400).send('error');
//               } else {
//                 if (category == null) {
//                   res.status(400).json({ message: 'failed', details: "No category found", status: "failed" });
//                 } else {

//                   if (category[0].subCategory.find(el => el.subCategoryName == req.body.categoryObj.subCategoryName)) {

//                     var tempData = category[0].subCategory.find(el => el.subCategoryName == req.body.categoryObj.subCategoryName);

//                     for (var j = 0; j < req.body.categoryObj.vehicles.length; j++) {
//                       var tempVehicle = {
//                         vehicleBrand: req.body.categoryObj.vehicles[j].vehicleBrand,
//                         vehicleName: req.body.categoryObj.vehicles[j].vehicleName,
//                         vehicleClass: req.body.categoryObj.vehicles[j].vehicleClass,
//                         modelType: req.body.categoryObj.vehicles[j].modelType,
//                         modelCapacity: req.body.categoryObj.vehicles[j].modelCapacity,
//                         vehiclePassengerCount: req.body.categoryObj.vehicles[j].vehiclePassengerCount,
//                         vehicleCapacityWeightLimit: req.body.categoryObj.vehicles[j].vehicleCapacityWeightLimit,
//                         adminCommission: req.body.categoryObj.vehicles[j].commission.adminCommission,
//                         companyCommission: req.body.categoryObj.vehicles[j].commission.companyCommission
//                       }
//                       tempData.vehicles.push(tempVehicle);
//                     }

//                     console.log(category[0].subCategory.find(el => el.subCategoryName == req.body.categoryObj.subCategoryName));

//                     VehicleCategory.findOneAndUpdate({ categoryName: req.body.categoryName }, { $set: { description: req.body.description, isEnable: req.body.isEnable } }, function (err) {
//                       if (err) {
//                         res.status(400).send(err);
//                       } else {
//                         res.json({ message: 'success', details: "Added Successfully" });
//                       }
//                     });

//                   }

//                   else {
//                     res.status(400).json({ message: 'failed', details: "No Sub category found", status: "failed" });
//                   }
//                   //category[0].subCategory

//                   // VehicleCategory.update({ 'categoryName': req.body.categoryObj.categoryName },
//                   //   {

//                   //     $push: {
//                   //       subCategory: req.body.categoryObj.subCategory[0]
//                   //     }
//                   //   }, function (err) {
//                   //     if (err) {
//                   //       console.log('#################### error occured #######################');
//                   //       console.log(err);
//                   //       res.status(400).send(err);
//                   //     } else {
//                   //       res.json({ message: 'success', details: "Added sub category Successfully", content: vehicleCategory });
//                   //     }
//                   //   });

//                 }
//               }
//             });

//         }
//       }
//     });

// };
