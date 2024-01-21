"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var Admin = require("../models/admin");
var Driver = require("../models/driver");
const Vehicle = require("../models/vehicle");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var imageUpload = require("./imageUpload");
var VehicleCategory = require("../models/vehiclecategory");
var ObjectId = require("mongodb").ObjectID;
// var OnlineVehicleTrack = require('../models/onlinevehicletracking');
// var OntripVehicleTrack = require('../models/ontripvehicletracking');
// var OfflineVehicleTrack = require('../models/offlinevehicletracking');
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

/// admin add vehicle
exports.addVehicle = function (req, res) {
  console.log(req.body);
  console.log(req.files);
  if (
    req.files.vehicleBookPic &&
    req.files.vehicleInsurancePic &&
    req.files.vehicleFrontPic &&
    req.files.vehicleSideViewPic &&
    req.files.vehicleRevenuePic
  ) {
    VehicleCategory.find({
      $and: [
        {
          categoryName: req.body.vehicleCategory,
        },
        {
          "subCategory.subCategoryName": req.body.subCategoryName,
        },
      ],
    }).exec(function (err, vcat) {
      console.log(vcat);
      if (err) {
        res.status(500).json({
          message: "internel error",
        });
      } else {
        if (vcat.length > 0) {
          console.log("vcat have");
          console.log(vcat);
          Driver.findOne({
            _id: req.body.driverId,
          }).exec(function (error, driver) {
            if (error) {
              res.status(206).json({
                message: "not found driver",
              });
            } else {
              if (driver !== null && driver.isEnable && driver.isApproved) {
                Vehicle.findOne({
                  vehicleRegistrationNo: req.body.vehicleRegistrationNo,
                }).exec(function (err, vehicles) {
                  if (err) {
                    res.status(500).json({
                      message: "internel error",
                    });
                  } else {
                    if (vehicles !== null) {
                      res.status(208).json({
                        message: "vehicle already registered",
                      });
                    } else {
                      console.log("####### null data ########");
                      var vehicle = new Vehicle();
                      vehicle.vehicleCategory = req.body.vehicleCategory;
                      vehicle.vehicleSubCategory = req.body.subCategoryName;
                      vehicle.ownerInfo.ownerContactName =
                        req.body.ownerContactName;
                      vehicle.ownerInfo.ownerContactNumber =
                        req.body.ownerContactNumber;
                      vehicle.ownerInfo.ownerContactEmail =
                        req.body.ownerContactEmail;
                      vehicle.ownerInfo.address.address = req.body.address;
                      vehicle.ownerInfo.address.street = req.body.street;
                      vehicle.ownerInfo.address.city = req.body.city;
                      vehicle.ownerInfo.address.zipcode = req.body.zipcode;
                      vehicle.ownerInfo.address.country = req.body.country;
                      vehicle.ownerInfo.isVerify = req.body.ownerVerify;
                      let info = {
                        driverId: req.body.driverId,
                        isEnableDriver: false,
                      };
                      vehicle.driverInfo.push(info);
                      vehicle.vehicleRevenueNo = req.body.vehicleRevenueNo;
                      vehicle.vehicleRevenueExpiryDate =
                        req.body.vehicleRevenueExpiryDate;
                      vehicle.vehicleLicenceNo = req.body.vehicleLicenceNo;
                      vehicle.vehicleRegistrationNo =
                        req.body.vehicleRegistrationNo;
                      vehicle.vehicleColor = req.body.vehicleColor;
                      vehicle.manufactureYear = req.body.manufactureYear;
                      vehicle.vehicleBrandName = req.body.vehicleBrandName;
                      vehicle.isApproved = true;

                      vehicle.save(function (err) {
                        if (err) {
                          console.log(
                            "#################### error occured #######################"
                          );
                          console.log(err);
                          res.send(err);
                        } else {
                          console.log(vehicle._id);
                          imageUpload.uploadImages(
                            req.files,
                            vehicle._id,
                            Vehicle,
                            "vehicles"
                          );
                          res.status(200).json({
                            message: "success",
                            details: "Vehicle registered successfully",
                          });
                        }
                      });
                    }
                  }
                });
              } else {
                res.status(203).json({
                  message: "Selected driver is not enabled",
                });
              }
            }
          });
        } else {
          res.status(206).json({
            message: "no vehicle category",
          });
        }
      }
    });
  } else {
    res.status(422).json({
      message: "vehicle images are missing",
    });
  }
};

// admin get vehicles to approve //
exports.getVehiclesToApprove = function (req, res) {
  Vehicle.find({
    isApproved: false,
  }).exec(function (err, vehicles) {
    if (err) {
      res.status(500).json({
        message: "internel error",
      });
    } else {
      if (vehicles.length > 0) {
        res.status(200).json({
          message: "success",
          content: vehicles,
        });
      } else {
        res.status(404).json({
          message: "No vehicles to approve",
        });
      }
    }
  });
};

// get agent vehicles to approve by company
exports.getvehiclestoapprovebycompany = function (req, res) {
  var companyCode = req.param.companyCode;

  Driver.aggregate(
    {
      $match: {
        companyCode: req.param.companyCode,
      },
    },
    {
      $lookup: {
        from: "vehicles",
        let: {
          ownerContactNumber: "$mobile",
        },
        pipeline: [
          {
            $match: {
              isApproved: false,
            },
          },
        ],
        as: "vehicles",
      },
    },
    // {
    //     $lookup: {
    //         from: "vehicles",
    //         localField: "mobile",
    //         foreignField: "ownerInfo.ownerContactNumber",
    //         as: "vehicles"
    //     }
    // },
    // {
    //     $match: {
    //         'vehicles.isApproved': false
    //     }

    // },
    {
      $project: {
        vehicles: 1,
      },
    },
    {
      $sort: { "vehicles.recordedTime": -1 },
    }
  ).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      console.log(result);
      if (result.length > 0) {
        res.status(200).json({
          message: "Success!",
          content: result[0]["vehicles"],
        });
      } else {
        res.status(200).json({
          message: "Failed",
          content: result,
        });
      }
    }
  });
};

// admin get approved vehicles //
exports.getApprovedVehicles = function (req, res) {
  Vehicle.find({
    isApproved: true,
  }).exec(function (err, vehicles) {
    if (err) {
      res.status(500).json({
        message: "internel error",
      });
    } else {
      if (vehicles.length > 0) {
        res.status(200).json({
          message: "success",
          content: vehicles,
        });
      } else {
        res.status(404).json({
          message: "No vehicles to approve",
        });
      }
    }
  });
};

// admin get approved vehicles pagination//
exports.getapprovedvehiclespagination = function (req, res) {
  var pageNo = req.body.pageNo;
  var paginationCount = req.body.paginationCount;
  var responseData;
  var param = req.body.param;

  Vehicle.find({
    isApproved: true,
    [param]: { $regex: req.body.text },
  })
    .sort({ recordedTime: -1 })
    .exec(function (err, vehicles) {
      if (err) {
        res.status(500).json({
          message: "internel error",
        });
      } else {
        if (vehicles.length > 0) {
          responseData = vehicles.slice(
            (pageNo - 1) * paginationCount,
            pageNo * paginationCount
          );

          res.status(200).json({
            message: "Success!",
            content: responseData,
            noOfPages: Math.ceil(vehicles.length / paginationCount),
            noOfRecords: vehicles.length,
          });
        } else {
          res.status(404).json({
            message: "No vehicles to approve",
          });
        }
      }
    });
};

// admin get approved vehicles pagination by company //
exports.getapprovedvehiclespaginationbycompany = function (req, res) {
  var pageNo = req.body.pageNo;
  var paginationCount = req.body.paginationCount;
  var responseData;
  var param = req.body.param;

  // Vehicle.find({
  //     'isApproved': true,
  //     [param]: { $regex: req.body.text }
  // }
  // ).sort({ recordedTime: -1 })
  //     .exec(function (err, vehicles) {
  //         if (err) {
  //             res.status(500).json({
  //                 message: 'internel error'
  //             });
  //         } else {
  //             if (vehicles.length > 0) {

  //                 responseData = vehicles.slice(((pageNo - 1) * paginationCount), (pageNo * paginationCount));

  //                 res.status(200).json({
  //                     message: 'Success!',
  //                     content: responseData,
  //                     noOfPages: Math.ceil(vehicles.length / paginationCount),
  //                     noOfRecords: vehicles.length
  //                 });
  //             } else {
  //                 res.status(404).json({
  //                     message: 'No vehicles to approve'
  //                 });
  //             }
  //         }
  //     })

  Driver.aggregate(
    {
      $match: {
        companyCode: req.body.companyCode,
      },
    },
    {
      $lookup: {
        from: "vehicles",
        localField: "mobile",
        foreignField: "ownerInfo.ownerContactNumber",
        as: "vehicles",
      },
    },
    // {
    //     $match: {

    //         $and: [
    //             {
    //                 'agentId': req.body.agentId
    //             },
    //             {
    //                 'transactionHistory.dateTime': {
    //                     $gte: fromDate,
    //                     $lt: toDate
    //                 }
    //             }
    //         ],
    //     },
    // },
    {
      $project: {
        vehicles: 1,
      },
    },
    {
      $sort: { "vehicles.recordedTime": -1 },
    }
  ).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      // var totalEarningsCal = 0

      // result.forEach(el => {
      //     if (el.transactionHistory.trip != null) {
      //         totalEarningsCal = totalEarningsCal + el.transactionHistory.trip.tripEarning;
      //     }
      // });
      // console.log("vehicles");
      // console.log(result);

      if (result != null) {
        responseData = result[0]["vehicles"].slice(
          (pageNo - 1) * paginationCount,
          pageNo * paginationCount
        );

        res.status(200).json({
          message: "Success!",
          content: responseData,
          noOfPages: Math.ceil(result[0]["vehicles"].length / paginationCount),
          noOfRecords: result[0]["vehicles"].length,
        });
      } else {
        res.status(200).json({
          message: "Failed",
          content: result,
        });
      }

      // res.status(200).json({
      //     content: result
      // })
    }
  });
};

// admin enable vehicle //
exports.adminEnableVehicle = function (req, res) {
  console.log("### in approve ###");
  Vehicle.findOne({
    _id: req.body.id,
  }).exec(function (err, vehicle) {
    if (err) {
      res.status(500).json({
        message: "Internel error",
      });
    } else {
      if (vehicle !== null) {
        if (vehicle.isApproved == true) {
          var newValues = {
            $set: {
              isEnable: req.body.isEnable,
            },
          };
          Vehicle.findByIdAndUpdate(
            req.body.id,
            newValues,
            function (error, results) {
              if (error) {
                console.log("err");
                res.status(500).json({
                  message: "Internel error",
                });
              } else {
                res.status(200).json({
                  message: "Success!",
                });
              }
            }
          );
        } else {
          res.status(409).json({
            message: "Vehicle is not approved",
          });
        }
      } else {
        res.status(404).json({
          message: "Vehicle not found",
        });
      }
    }
  });
};

exports.updateVehicle = function (req, res) {
  VehicleCategory.find({
    $and: [
      {
        categoryName: req.body.vehicleCategory,
      },
      {
        "subCategory.subCategoryName": req.body.subCategoryName,
      },
    ],
  }).exec(function (err, vcat) {
    if (err) {
      res.status(500).json({
        message: "internel error",
      });
    } else {
      if (vcat.length > 0) {
        let newValues = {
          $set: {
            vehicleCategory: req.body.vehicleCategory,
            vehicleSubCategory: req.body.subCategoryName,
            vehicleRevenueNo: req.body.vehicleRevenueNo,
            vehicleRevenueExpiryDate: req.body.vehicleRevenueExpiryDate,
            vehicleLicenceNo: req.body.vehicleLicenceNo,
            vehicleRegistrationNo: req.body.vehicleRegistrationNo,
            vehicleColor: req.body.vehicleColor,
            manufactureYear: req.body.manufactureYear,
            vehicleBrandName: req.body.vehicleBrandName,
            "ownerInfo.ownerContactName": req.body.ownerContactName,
            "ownerInfo.ownerContactNumber": req.body.ownerContactNumber,
            "ownerInfo.ownerContactEmail": req.body.ownerContactEmail,
            "ownerInfo.address.addrss": req.body.address,
            "ownerInfo.address.street": req.body.street,
            "ownerInfo.address.zipcode": req.body.zipcode,
            "ownerInfo.address.city": req.body.city,
            "ownerInfo.address.country": req.body.country,
          },
        };

        imageUpload.uploadImagesCallback(
          req.files,
          req.body._id,
          Vehicle,
          "vehicles",
          function (response) {
            console.log("############### Image Uploded #################");
          }
        );

        Vehicle.findByIdAndUpdate(
          mongoose.Types.ObjectId(req.body._id),
          newValues,
          function (err, results) {
            if (err) {
              res.status(500).json({
                message: err,
              });
            } else {
              res.status(200).json({
                message: "success",
                content: results,
              });
            }
          }
        );
      } else {
        console.log(req.body);
        res.status(422).json({
          message: "invalid request data",
        });
      }
    }
  });
};

exports.approveVehicle = function (req, res) {
  Vehicle.findOne({
    _id: req.body.id,
  }).exec(function (err, vehicle) {
    if (err) {
      res.status(500).json({
        message: "server error",
      });
    } else {
      if (vehicle !== null) {
        if (vehicle.isApproved == false) {
          var newValues = {
            $set: {
              isApproved: true,
            },
          };
          Vehicle.findByIdAndUpdate(
            req.body.id,
            newValues,
            function (err, results) {
              if (err) {
                res.status(500).json({
                  message: "server error!",
                });
              } else {
                res.status(200).json({
                  message: "success!",
                });
              }
            }
          );
        } else {
          res.status(409).json({
            message: "Vehicle already approved.",
          });
        }
      } else {
        res.status(406).json({
          message: "Vehicle is not avilable",
        });
      }
    }
  });
};

exports.addDriverToVehicle = function (req, res) {
  console.log(req.body.driverInfo);
  var driverObj = req.body.driverInfo;
  Vehicle.update(
    {
      _id: mongoose.Types.ObjectId(req.body._id),
      "driverInfo.driverId": { $ne: req.body.driverInfo[0].driverId },
    },
    {
      $addToSet: {
        driverInfo: {
          $each: driverObj,
        },
      },
    }
  ).exec(function (err, results) {
    if (err) {
      res.status(500).json({
        message: err,
      });
    } else {
      if (results == null) {
        res.status(400).json({ message: "No vehicle" });
      } else {
        if (results.nModified > 0) {
          var title = `Taxime Vehicle`;
          var msg = `Vehicle added to your driver account`;
          DriverPushNotification.sendPushNotificationToDriver(
            req.body.driverInfo[0].driverId,
            title,
            msg
          );

          res.status(200).json({
            message: "success!",
            content: results,
          });
        } else {
          res.status(304).json({
            message: "Not Modified!",
            content: results,
          });
        }
      }
    }
  });
};

exports.deleteDrivers = function (req, res) {
  var driverObj = req.body.driverInfo;
  let newValues = {
    $pull: {
      driverInfo: {
        driverId: {
          $in: driverObj,
        },
      },
    },
  };

  Vehicle.findByIdAndUpdate(
    mongoose.Types.ObjectId(req.body._id),
    newValues,
    function (err, results) {
      if (err) {
        res.status(500).json({
          message: "server error",
        });
      } else {
        res.status(200).json({
          message: "success!",
        });
      }
    }
  );
};

// change details of assinged driver of vehicle
exports.changeVehicleDriverState = function (req, res) {
  if (req.body.isEnableDriver == false) {
    Vehicle.update(
      {
        _id: req.body.vehicleId,
        "driverInfo.driverId": req.body.driverId,
      },
      {
        $set: {
          "driverInfo.$.isEnableDriver": req.body.isEnableDriver,
        },
      }
    ).exec(function (err, result) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (result.nModified > 0) {
          res.status(200).json({
            message: "success!",
            content: result,
          });
        } else {
          res.status(304).json({
            message: "Not Modified!",
            content: result,
          });
        }
      }
    });
  } else if (req.body.isEnableDriver == true) {
    Vehicle.findOne({
      _id: req.body.vehicleId,
      "driverInfo.driverId": req.body.driverId,
      "driverInfo.isEnableDriver": true,
    }).exec(function (err, driver) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (driver != null) {
          res.status(400).json({ message: "can not enable two drivers!" });
        } else {
          Vehicle.update(
            {
              _id: req.body.vehicleId,
              "driverInfo.driverId": req.body.driverId,
            },
            {
              $set: {
                "driverInfo.$.isEnableDriver": req.body.isEnableDriver,
              },
            }
          ).exec(function (err, result) {
            if (err) {
              res.status(500).send(err);
            } else {
              if (result.nModified > 0) {
                res.status(200).json({
                  message: "success!",
                  content: result,
                });
              } else {
                res.status(304).json({
                  message: "Not Modified!",
                  content: result,
                });
              }
            }
          });
        }
      }
    });
  } else {
    res.status(500).json({ message: "Server Error!" });
  }
};

// manage drivers
exports.manageDrivers = function (req, res) {
  Vehicle.aggregate([
    {
      $match: {
        _id: ObjectId(req.body.vehicleId),
      },
    },
    {
      $unwind: "$driverInfo",
    },
    {
      $lookup: {
        from: "drivers",
        localField: "driverInfo.driverId",
        foreignField: "_id",
        as: "driver",
      },
    },
    {
      $project: {
        "driver.otpPin": 0,
        "driver.saltSecret": 0,
        "driver.otpTime": 0,
      },
    },
    {
      $unwind: "$driver",
    },
    {
      $project: {
        "driverInfo.isEnableDriver": 1,
        driverInformation: [
          {
            driver: "$driver",
          },
        ],
      },
    },
  ]).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      console.log(result);
      if (result.length > 0) {
        res.json({
          message: "Success!",
          content: result,
        });
      } else {
        res.status(204).json();
      }
    }
  });
};

// admin delete vehicle //
exports.deleteVehicle = function (req, res) {
  Vehicle.findOne({
    _id: req.body.id,
  }).exec(function (err, vehicle) {
    if (err) {
      res.status(500).json({
        message: "Internel server error",
      });
    } else {
      if (vehicle !== null) {
        console.log("## deleting vehicle ##");
        Vehicle.findByIdAndRemove(req.body.id).exec(function (err, results) {
          if (err) {
            res.status(500).json({
              message: "Internel error",
            });
          } else {
            console.log("deleted");
            res.status(200).json({
              message: "Delete success!",
            });
          }
        });
      } else {
        res.status(404).json({
          message: "vehicle not found",
        });
      }
    }
  });
};

exports.updateVehicleImagesById = function (req, res) {
  if (req.files != null) {
    imageUpload.uploadImagesCallback(
      req.files,
      req.body.vehicleId,
      Vehicle,
      "vehicles",
      function (response) {
        console.log(response);
        res.status(200).json({ message: "success" });
        // imageUpload.uploadImages(req.files, users._id, User, 'users');
      }
    );
  } else {
    res.status(500).json({ message: "server error" });
  }
};
