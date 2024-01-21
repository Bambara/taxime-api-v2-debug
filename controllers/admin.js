"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const Admin = require("../models/admin");
// const Agent = require("../models/agent");
const Driver = require("../models/driver");
// const Dispatcher = require("../models/dispatcher");
const Vehicle = require("../models/vehicle");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const imageUpload = require("./imageUpload");
const otp = require("../services/randomnum");
// const adminRegEmail = require("../emailTemplate/adminRegister");
const User = require("../models/user");
const VehicleTracking = require("../models/vehicletracking");
const VehicleCategory = require("../models/vehiclecategory");
const geolib = require("geolib");
const ManualCustomer = require("../models/manualcustomer");
const CompanyWallet = require("../models/companywallet");
const AgentWallet = require("../models/agentwallet");
const RoadPickup = require("../models/roadPickupTrip");
const Trip = require("../models/trip");
const Settings = require("../models/setting");
// const Promotion = require("../models/promotion");
const PromotionController = require("../controllers/promotion");
const DriverPushNotification = require("../services/driverPushNotification");

const Dispatch = require("../models/dispatch");
// const Vehicle = require('../models/vehicle');
const config = require("../config");
const ObjectId = require("mongodb").ObjectID;

require("dotenv").config();

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

exports.admin = function (req, res) {
  console.log("###### Admin ######");
  res.json({
    status: "Admin",
  });
};

exports.registerAdmin = function (req, res) {
  console.log("###### admin register ######");
  console.log(req.body);

  Admin.findOne({
    email: req.body.email,
  }).exec(function (err, admins) {
    if (err) {
      console.log("####### error occured");
    } else {
      if (admins !== null) {
        console.log(
          "####################### not an null data : user already exist ##########################"
        );
        res.status(409).json({
          message: "email taken",
        });
      } else {
        console.log(
          "####################### null data ##########################"
        );
        // console.log(req);
        var admin = new Admin();

        admin.firstName = req.body.firstName;
        admin.lastName = req.body.lastName;
        admin.email = req.body.email;
        admin.nic = req.body.nic;
        admin.birthday = req.body.birthday;

        admin.password = bcrypt.hashSync(req.body.password, 10);

        admin.mobile = req.body.mobile;
        admin.gender = req.body.gender;
        admin.role = req.body.role;
        admin.companyCode = req.body.companyCode;
        admin.companyName = req.body.companyName;
        admin.companyType = req.body.companyType;

        admin.address.address = req.body.address;
        admin.address.street = req.body.street;
        admin.address.city = req.body.city;
        admin.address.zipcode = req.body.zipcode;
        admin.address.country = req.body.country;

        admin.save(function (err) {
          if (err) {
            console.log(
              "#################### error occured #######################"
            );
            console.log(err);
            res.send(err);
          } else {
            res.status(200).json({
              message: "success",
              details: "Signup successful",
            });
          }
        });
      }
    }
  });
};

exports.registerAgent = function (req, res) {
  console.log("###### admin : registerAgent ######");
  console.log(req.body);

  Admin.findOne({
    email: req.body.email,
  }).exec(function (err, admins) {
    if (err) {
      console.log("####### error occured");
    } else {
      if (admins !== null) {
        console.log(
          "####################### not an null data : agent already exist ##########################"
        );
        res.status(409).json({
          message: "this email is taken",
        });
      } else {
        console.log(
          "####################### null data ##########################"
        );
        // console.log(req);
        var admin = new Admin();

        admin.firstName = req.body.firstName;
        admin.lastName = req.body.lastName;
        admin.email = req.body.email;
        admin.nic = req.body.nic;
        admin.birthday = req.body.birthday;

        admin.password = bcrypt.hashSync(req.body.password, 10);

        admin.mobile = req.body.mobile;
        admin.gender = req.body.gender;

        admin.role = req.body.role;
        admin.companyCode = req.body.companyCode;
        admin.companyName = req.body.companyName;
        admin.companyType = req.body.companyType;

        admin.address.address = req.body.address;
        admin.address.street = req.body.street;
        admin.address.city = req.body.city;
        admin.address.zipcode = req.body.zipcode;
        admin.address.country = req.body.country;

        var agentwallet = new AgentWallet();

        agentwallet.companyCode = req.body.companyCode;
        agentwallet.agentId = admin._id;

        admin.save(function (err) {
          if (err) {
            console.log(
              "#################### error occured #######################"
            );
            console.log(err);
            res.send(err);
          } else {
            agentwallet.save(function (err) {
              if (err) {
                console.log(
                  "#################### error occured #######################"
                );
                console.log(err);
                res.send(err);
              } else {
                res.status(200).json({
                  message: "success",
                  details: "Signup successful",
                });
              }
            });
          }
        });
      }
    }
  });
};

/* update admin */
exports.adminUpdateById = function (req, res) {
  console.log("###### admin update ######");
  console.log(req.body);

  let newValues;

  newValues = {
    $set: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      nic: req.body.nic,
      birthday: req.body.birthday,
      mobile: req.body.mobile,
      gender: req.body.gender,
      role: req.body.role,

      companyName: req.body.companyName,
      companyCode: req.body.companyCode,
      companyType: req.body.companyType,

      "address.address": req.body.address,
      "address.street": req.body.street,
      "address.city": req.body.city,
      "address.zipcode": req.body.zipcode,
      "address.country": req.body.country,
    },
  };

  Admin.findByIdAndUpdate(req.body.adminId, newValues, function (err, results) {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: err,
      });
    } else {
      if (results != null) {
        console.log(results);

        res.status(200).json({
          message: "successfully updated",
        });
      } else {
        console.log(results);
        console.log(req.body.driverId);
        res.status(500).json({
          message: "update failed",
        });
      }
    }
  });
};

/* ### SignIn / Login ### */
exports.signInAdmin = function (req, res) {
  console.log("###### admin signIn #######");
  //res.json({status: 'sign In'});
  Admin.findOne({
    email: req.body.email,
  }).exec(function (err, admin) {
    if (err) {
      console.log("####### error occured" + err);
      // logger.error(err)
      res.send("error");
    } else {
      if (admin !== null) {
        console.log(
          "####################### not an null data : admin already exist ##########################"
        );

        if (admin.isVerified) {
          if (bcrypt.compareSync(req.body.password, admin.password)) {
            let admi = {
              id: admin._id,
              name: admin.firstName + " " + admin.lastName,
              role: admin.role,
              companyCode: admin.companyCode,
              companyName: admin.companyName,
              companyType: admin.companyType,
            };
            res.status(200).json({
              message: "success",
              details: "Login successfully",
              content: admi,
              token: jwt.sign(
                {
                  email: admin.email,
                  firstName: admin.firstName,
                  lastName: admin.lastName,
                  role: admin.role,
                  _id: admin._id,
                },
                "RESTFULAPIs"
              ),
            });
          } else {
            res.status(400).json({
              message: "failed",
              details: "Username or Password Incorrect",
              status: "signin_failed",
            });
          }
        } else {
          res.status(400).json({
            message: "failed",
            details: "Please confirm your Email",
            status: "signin_failed",
          });
        }
      } else {
        console.log(
          "####################### null data ##########################"
        );
        res.status(403).json({
          message: "failed",
          details: "Username or Password Incorrect",
          status: "signin_failed",
        });
      }
    }
  });
};

/* get all admins */
/**get users */
exports.getAllAdmins = function (req, res) {
  console.log("###### admin : getAllAdmins ######");

  Admin.find({
    companyType: "master",
  })
    .sort({ recordedTime: -1 })
    .exec(function (err, admins) {
      if (err) {
        console.log("####### error occured" + err);
        res.status(400).send("error");
      } else {
        if (admins == null) {
          res.status(400).json({
            message: "failed",
            details: "No data found",
            status: "failed",
          });
        } else {
          res.json({
            message: "success",
            details: "get admins data Successfully",
            content: admins,
          });
        }
      }
    });
};

exports.getAdminDataById = function (req, res) {
  console.log("###### get admin data #######");

  var adminId = new ObjectId(req.body.adminId);

  Admin.findOne({
    _id: new ObjectId(req.body.adminId),
  })
    .select({
      " password": 0,
    })
    .exec(function (err, admin) {
      if (err) {
        console.log("####### error occured" + err);
        res.send("error");
      } else {
        if (admin !== null) {
          console.log(
            "####################### not an null data ##########################"
          );

          let address = {
            address: admin.address.address,
            street: admin.address.street,
            city: admin.address.city,
            //zipcode: admin.address.zipcode,
            //country: admin.address.country
          };

          let adminInfo = {
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            nic: admin.nic,
            birthday: admin.birthday,
            mobile: admin.mobile,
            gender: admin.gender,
            address: address,
            isEnable: admin.isEnable,
            isVerified: admin.isVerified,
            lastLogin: admin.lastLogin,
            role: admin.role,
            companyCode: admin.companyCode,
            recordedTime: admin.recordedTime,
          };

          console.log(adminInfo);

          res.status(200).json({
            message: "success",
            details: "user data retrived successfully",
            content: adminInfo,
          });
        } else {
          console.log(
            "####################### null data ##########################"
          );
          res.status(403).json({
            message: "failed",
            details: "User not found",
          });
        }
      }
    });
};

// Admin add Driver

exports.addDriver = function (req, res) {
  console.log("Add driver by admin");
  if (
    req.files.driverPic &&
    req.files.nicFrontPic &&
    req.files.nicBackPic &&
    req.files.drivingLicenceFrontPic &&
    req.files.drivingLicenceBackPic
  ) {
    Driver.findOne({
      $or: [
        {
          email: req.body.email,
        },
        {
          mobile: req.body.mobile,
        },
      ],
    }).exec(function (err, drivers) {
      if (err) {
        console.log("####### error occured" + err);
        res.status(500).json({
          message: "internel error",
        });
      } else {
        if (drivers !== null) {
          console.log(
            "####################### not an null data : Driver already exist ##########################"
          );
          res.status(409).json({
            message: "failed",
            details: "email or mobile already registered!",
            status: "signup_failed",
          });
        } else {
          console.log(
            "####################### null data ##########################"
          );
          var driver = new Driver();
          driver.firstName = req.body.firstName;
          driver.lastName = req.body.lastName;
          driver.email = req.body.email;
          driver.otpPin = otp.otpGen();
          driver.otpTime = new Date();
          driver.nic = req.body.nic;
          driver.birthday = req.body.birthday;
          driver.mobile = req.body.mobile;
          driver.gender = req.body.gender;

          driver.address.address = req.body.address;
          driver.address.street = req.body.street;
          driver.address.zipcode = req.body.zipcode;

          driver.address.country = req.body.country;
          driver.address.province = req.body.province;
          driver.address.district = req.body.district;
          driver.address.city = req.body.city;

          //driver.lifeInsuranceNo = req.body.lifeInsuranceNo;
          //driver.lifeInsuranceExpiryDate = req.body.lifeInsuranceExpiryDate;
          //driver.lifeInsuranceAmount = req.body.lifeInsuranceAmount;
          driver.isApproved = true;
          let salt = bcrypt.hashSync(req.body.email, 5);
          driver.saltSecret = salt.replace(/[^a-zA-Z ]/g, "");
          driver.driverCode =
            process.env.APP_SHORT_NAME + "" + otp.generateRefToken();

          driver.save(function (err) {
            if (err) {
              console.log(
                "#################### error occured #######################"
              );
              console.log(err);
              res.send(err);
            } else {
              imageUpload.uploadImages(
                req.files,
                driver._id,
                Driver,
                "drivers"
              );
              // driverRegEmail.driverRegEmail(req.body.email, driver.saltSecret);
              res.status(200).json({
                message: "success",
                details: "Driver registered successfully",
              });
            }
          });
        }
      }
    });
  } else {
    res.status(409).json({
      message: "driver images are missing",
    });
  }
};

/// admin get driver details ///
exports.getDrivers = function (req, res) {
  Driver.find({})
    .select({
      otpPin: 0,
      otpTime: 0,
      saltSecret: 0,
    })
    .exec(function (err, drivers) {
      if (err) {
        res.status(500).json({
          message: "server error",
        });
      } else {
        if (drivers !== null) {
          res.status(200).json({
            message: "selection success",
            content: drivers,
          });
        } else {
          res.status(404).json({
            message: "no drivers found",
          });
        }
      }
    });
};

// admin approve driver //
exports.adminApproveDriver = function (req, res) {
  console.log("### in approve ###");
  Driver.findOne({
    _id: req.body.id,
  }).exec(function (err, driver) {
    if (err) {
      res.status(500).json({
        message: "internel error",
      });
    } else {
      if (driver !== null) {
        if (driver.isApproved == false) {
          var newValues = {
            $set: {
              isApproved: true,
            },
          };
          Driver.findByIdAndUpdate(
            req.body.id,
            newValues,
            function (error, results) {
              if (error) {
                res.status(500).json({
                  message: "server error",
                });
              } else {
                var title = `Taxime Driver`;
                var msg = `Your taxime driver account approved`;
                DriverPushNotification.sendPushNotificationToDriver(
                  req.body.id,
                  title,
                  msg
                );

                res.status(200).json({
                  message: "Driver Approve successfully!",
                });
              }
            }
          );
        } else {
          res.status(409).json({
            message: "Driver already approved",
          });
        }
      } else {
        res.status(404).json({
          message: "Driver not found",
        });
      }
    }
  });
};

// admin get drivers to approve //
exports.getDriversToApprove = function (req, res) {
  console.log("############# getDriversToApprove #############");
  Driver.find({
    isApproved: false,
  })
    .select({
      otpPin: 0,
      otpTime: 0,
      saltSecret: 0,
    })
    .exec(function (err, drivers) {
      if (err) {
        res.status(500).json({
          message: "internel error",
        });
      } else {
        if (drivers.length > 0) {
          res.status(200).json({
            message: "success",
            content: drivers,
          });
        } else {
          res.status(404).json({
            message: "No drivers to approve",
          });
        }
      }
    });
};

// admin get drivers to approve by company //
exports.getdriverstoapprovebycompany = function (req, res) {
  console.log("############# getDriversToApprove #############");
  Driver.find({
    isApproved: false,
    companyCode: req.body.companyCode,
  })
    .select({
      otpPin: 0,
      otpTime: 0,
      saltSecret: 0,
    })
    .exec(function (err, drivers) {
      if (err) {
        res.status(500).json({
          message: "internel error",
        });
      } else {
        if (drivers.length > 0) {
          res.status(200).json({
            message: "success",
            content: drivers,
          });
        } else {
          res.status(404).json({
            message: "No drivers to approve",
          });
        }
      }
    });
};

/**get users */
exports.getAllUsers = function (req, res) {
  console.log("###### get Users ######");
  User.find({ isApproved: true }).exec(function (err, category) {
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
          details: "get User data Successfully",
          content: category,
        });
      }
    }
  });
};

/**get users */
exports.getAllUserspagination = function (req, res) {
  var pageNo = req.body.pageNo;
  var paginationCount = req.body.paginationCount;
  var responseData;

  var param = req.body.param;

  console.log("###### get Users ######");
  // User.find({ isApproved: true, [param]: { $regex: req.body.text } })
  User.aggregate([
    {
      $match: {
        $and: [
          {
            isApproved: true,
          },
          // {
          //     [param]: { $regex: req.body.text }
          // }
        ],
      },
    },
    {
      $lookup: {
        from: "passengerwallets",
        localField: "_id",
        foreignField: "passengerId",
        as: "wallet",
      },
    },
    {
      $match: {
        $and: [
          {
            [param]: { $regex: req.body.text },
          },
        ],
      },
    },
  ])
    .sort({ recordedTime: -1 })
    .exec(function (err, data) {
      if (err) {
        console.log("####### error occured" + err);
        res.status(400).send("error");
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

          res.status(200).json({
            message: "Success!",
            content: responseData,
            noOfPages: data / paginationCount,
            noOfRecords: data.length,
          });

          // res.json({
          //     message: 'success',
          //     details: "get User data Successfully",
          //     content: data
          // });
        }
      }
    });
};

exports.addUser = function (req, res) {
  var user = new User();
  user.name = req.body.firstName + " " + req.body.lastName;
  user.email = null;
  user.birthday = req.body.birthday;
  user.contactNumber = req.body.mobile;
  user.address.address = req.body.address;
  user.address.zipcode = req.body.zipcode;
  user.address.city = req.body.city;
  user.address.country = req.body.country;
  user.isApproved = true;

  user.save(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: "success!" });
    }
  });
};

exports.clearVehicleTracks = function (req, res) {
  VehicleTracking.remove({}).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: "success!" });
    }
  });
};

exports.adminloginRequired = function (req, res, next) {
  console.log("###### login required ######");
  // console.log(role)
  // return function(req, res, next) {
  if (req.user) {
    console.log("##$$%##");
    console.log(req.user);

    Admin.findOne({
      _id: req.user._id,
    }).exec(function (err, admin) {
      if (err) {
        console.log("err");
        res.status(401).json({
          message: "Unauthorized user!",
        });
      } else {
        if (admin !== null) {
          // if(arguments.length > 0) {
          //     var allow = false;
          //     for (var i=0; i < arguments.length; i++) {

          //         if(arguments[i] == admin.role) {

          //             allow = true;
          //             break;
          //         }
          //     }
          //     if(allow) {
          //         next();
          //     } else {
          //         res.status(401).json({
          //             message: 'Unauthorized user!'
          //         });
          //     }
          // }
          // else {
          //     next();
          // }
          next();
        } else {
          res.status(401).json({
            message: "Unauthorized user!",
          });
        }
      }
    });
  } else {
    res.status(401).json({
      message: "Unauthorized user!",
    });
  }
  // };
};

// get all drivers in vehicle tracking
exports.getVehicleTracking = function (req, res) {
  VehicleTracking.aggregate([
    {
      $lookup: {
        from: "vehiclecategories",
        localField: "vehicleCategory",
        foreignField: "categoryName",
        as: "vehicleCategoryData",
      },
    },
    {
      $unwind: "$vehicleCategoryData",
    },
    // { "$match": { "vehicleCategory.subCategory.subCategoryName": "test1" } },
    {
      $project: {
        _id: 1,
        currentStatus: 1,
        vehicleSubCategory: 1,
        vehicleCategory: 1,
        driverId: 1,
        currentLocation: 1,
        driverInfo: 1,
        vehicleInfo: 1,
        "vehicleCategoryData.subCategory": {
          $filter: {
            input: "$vehicleCategoryData.subCategory",
            as: "subCat",
            cond: {
              $eq: ["$$subCat.subCategoryName", "$vehicleSubCategory"],
            },
          },
        },
      },
    },
  ]).exec(function (err, data) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (data == null) {
        res.status(400).json({
          message: "failed",
          details: "No data found",
          status: "failed",
        });
      } else {
        let resp = [];
        /*
                                                                                data.forEach((el,i) => {
                                                                                    resp.push({
                                                                                        currentLocation: {
                                                                                            address : el.currentLocation.address,
                                                                                            latitude : el.currentLocation.latitude,
                                                                                            longitude : el.currentLocation.longitude,
                                                                                        },
                                                                                        currentStatus: el.currentStatus,
                                                                                        driverId: el.driverId,
                                                                                        driverInfo: el.driverInfo,
                                                                                        vehicleCategory: el.vehicleCategory,
                                                                                        vehicleCategoryData: el.vehicleCategoryData,
                                                                                        vehicleInfo: el.vehicleInfo,
                                                                                        vehicleSubCategory: el.vehicleSubCategory
                                                                                    });
                                                                                    resp.push({
                                                                                        currentLocation: {
                                                                                            address : el.currentLocation.address,
                                                                                            latitude : el.currentLocation.latitude + (0.001 * otp.rndNo()),
                                                                                            longitude : el.currentLocation.longitude + (0.001 * otp.rndNo()),
                                                                                        },
                                                                                        currentStatus: el.currentStatus,
                                                                                        driverId: el.driverId + i + '-1',
                                                                                        driverInfo: el.driverInfo,
                                                                                        vehicleCategory: el.vehicleCategory,
                                                                                        vehicleCategoryData: el.vehicleCategoryData,
                                                                                        vehicleInfo: el.vehicleInfo,
                                                                                        vehicleSubCategory: el.vehicleSubCategory
                                                                                    });
                                                                                    resp.push({
                                                                                        currentLocation: {
                                                                                            address : el.currentLocation.address,
                                                                                            latitude : el.currentLocation.latitude - (0.001 * otp.rndNo()),
                                                                                            longitude : el.currentLocation.longitude - (0.001 * otp.rndNo()),
                                                                                        },
                                                                                        currentStatus: el.currentStatus,
                                                                                        driverId: el.driverId + i + '-2',
                                                                                        driverInfo: el.driverInfo,
                                                                                        vehicleCategory: el.vehicleCategory,
                                                                                        vehicleCategoryData: el.vehicleCategoryData,
                                                                                        vehicleInfo: el.vehicleInfo,
                                                                                        vehicleSubCategory: el.vehicleSubCategory
                                                                                    });
                                                                                    resp.push({
                                                                                        currentLocation: {
                                                                                            address : el.currentLocation.address,
                                                                                            latitude : el.currentLocation.latitude - (0.001 * otp.rndNo()),
                                                                                            longitude : el.currentLocation.longitude - (0.001 * otp.rndNo()),
                                                                                        },
                                                                                        currentStatus: el.currentStatus,
                                                                                        driverId: el.driverId + i + '-3',
                                                                                        driverInfo: el.driverInfo,
                                                                                        vehicleCategory: el.vehicleCategory,
                                                                                        vehicleCategoryData: el.vehicleCategoryData,
                                                                                        vehicleInfo: el.vehicleInfo,
                                                                                        vehicleSubCategory: el.vehicleSubCategory
                                                                                    });
                                                                                });
                                                                                console.log(data);
                                                            */
        res.json({
          message: "success",
          details: "get data Successfully",
          content: data,
        });
      }
    }
  });
};

// get online drivers near pickup location
exports.getOnlneDriversByRadious = function (req, res) {
  VehicleTracking.aggregate([
    {
      $match: {
        currentStatus: "online",
      },
    },
    {
      $lookup: {
        from: "vehiclecategories",
        localField: "vehicleCategory",
        foreignField: "categoryName",
        as: "vehicleCategoryData",
      },
    },
    {
      $unwind: "$vehicleCategoryData",
    },
    // { "$match": { "vehicleCategory.subCategory.subCategoryName": "test1" } },
    {
      $project: {
        _id: 1,
        currentStatus: 1,
        vehicleSubCategory: 1,
        vehicleCategory: 1,
        driverId: 1,
        currentLocation: 1,
        driverInfo: 1,
        vehicleInfo: 1,
        "vehicleCategoryData.subCategory": {
          $filter: {
            input: "$vehicleCategoryData.subCategory",
            as: "subCat",
            cond: {
              $eq: ["$$subCat.subCategoryName", "$vehicleSubCategory"],
            },
          },
        },
      },
    },
  ]).exec(function (err, data) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (data == null) {
        res.status(400).json({
          message: "failed",
          details: "No data found",
          status: "failed",
        });
      } else {
        var tempData = [];

        data.forEach(function (element) {
          if (
            geolib.isPointInCircle(
              {
                latitude: element.currentLocation.latitude,
                longitude: element.currentLocation.longitude,
              },
              {
                latitude: req.body.latitude,
                longitude: req.body.longitude,
              },
              5000
            )
          ) {
            tempData.push(element);
          }
        });

        res.json({
          message: "success",
          details: "get category data Successfully",
          content: tempData,
        });
      }
    }
  });
};

/**get Manual customers */
exports.getAllManualCustomers = function (req, res) {
  console.log("###### get Manual customers ######");

  console.log(req.params.text);

  ManualCustomer.find({ mobile: { $regex: req.params.text } }).exec(function (
    err,
    data
  ) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      res.json({
        message: "success",
        details: "get data Successfully",
        content: data,
      });
    }
  });
};

/**get Manual customers */
exports.getAllManualCustomerspagination = function (req, res) {
  var pageNo = req.body.pageNo;
  var paginationCount = req.body.paginationCount;
  var responseData;
  var param = req.body.param;

  console.log("###### get Manual customers ######");

  console.log(req.params.text);

  ManualCustomer.find({ [param]: { $regex: req.body.text } })
    .sort({ recordedTime: -1 })
    .exec(function (err, data) {
      if (err) {
        console.log("####### error occured" + err);
        res.status(400).send("error");
      } else {
        responseData = data.slice(
          (pageNo - 1) * paginationCount,
          pageNo * paginationCount
        );

        res.status(200).json({
          message: "Success!",
          content: responseData,
          noOfPages: data / paginationCount,
          noOfRecords: data.length,
        });
      }
    });
};

exports.createCompanyWallet = function (req, res) {
  var wallet = new CompanyWallet();
  wallet.companyName = "TaxiMeCompany";
  wallet.companyCode = "TAXIME";
  wallet.companyType = "master";
  wallet.save(function (err, walletres) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: "success" });
    }
  });
};

exports.getDashboardData = function (req, res) {
  var fromDate = new Date(req.params.from);
  var toDate = new Date(req.params.to);

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

  var i = 0;

  var response = {
    CanceledTrips: 0,
    RegisteredDriveres: 0,
    pendingDrivers: 0,
    registeredVehicles: 0,
    pendingVehicles: 0,
    totalIncome: 0,
    commissionIncome: 0,
    CompletedTrips: 0,
  };

  //completed trips
  // Dispatch.aggregate([{
  //     $match: {
  //         $and: [{
  //             $or: [{
  //                 status: 'done'
  //             }]
  //         },
  //         {
  //             recordedTime: {
  //                 $gte: fromDate,
  //                 $lt: toDate
  //             }
  //         }
  //         ],
  //     },
  // }])
  //     .exec(function (err, result) {
  //         if (err) {
  //             // res.status(500).send(err)
  //             i++;
  //         } else {
  //             response.CompletedTrips = result.length;
  //             i++;
  //             if (i == 7) {
  //                 res.status(200).json({
  //                     message: 'success',
  //                     content: response
  //                 });
  //             }
  //         }
  //     })

  //canceled dispatch trips
  Dispatch.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                status: "canceled",
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
  ]).exec(function (err, result) {
    if (err) {
      // res.status(500).send(err)
      i++;
    } else {
      response.CanceledTrips = response.CanceledTrips + result.length;
      // response.CanceledTrips = result.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  //canceled trips
  Trip.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                status: "canceled",
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
      // res.status(500).send(err)
      i++;
    } else {
      response.CanceledTrips = response.CanceledTrips + result1.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  //Approved drivers
  Driver.aggregate([
    {
      $match: {
        $and: [
          {
            isApproved: true,
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
  ]).exec(function (err, drivers) {
    if (err) {
      // res.status(500).json({
      //     message: 'Internel error'
      // });
      i++;
    } else {
      response.RegisteredDriveres = drivers.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  //pending drivres
  Driver.aggregate([
    {
      $match: {
        $and: [
          {
            isApproved: false,
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
  ]).exec(function (err, drivers) {
    if (err) {
      // res.status(500).json({
      //     message: 'Internel error'
      // });
      i++;
    } else {
      response.pendingDrivers = drivers.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  // approved vehicles
  Vehicle.aggregate([
    {
      $match: {
        $and: [
          {
            isApproved: true,
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
  ]).exec(function (err, vehicles) {
    if (err) {
      // res.status(500).json({
      //     message: 'internel error'
      // });
      i++;
    } else {
      response.registeredVehicles = vehicles.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  // pending vehicles
  Vehicle.aggregate([
    {
      $match: {
        $and: [
          {
            isApproved: false,
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
  ]).exec(function (err, vehicles) {
    if (err) {
      // res.status(500).json({
      //     message: 'internel error'
      // });
      i++;
    } else {
      response.pendingVehicles = vehicles.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  CompanyWallet.aggregate(
    {
      $unwind: "$transactionHistory",
    },
    {
      $match: {
        $and: [
          {
            "transactionHistory.dateTime": {
              $gte: fromDate,
              $lt: toDate,
            },
          },
        ],
      },
    }
  ).exec(function (err, result) {
    if (err) {
      i++;
    } else {
      i++;
      var totalEarningsCal = 0;
      var commissionEarningsCal = 0;
      var completedTripCal = 0;

      result.forEach((el) => {
        if (el.transactionHistory.trip != null) {
          commissionEarningsCal =
            commissionEarningsCal + el.transactionHistory.trip.tripEarning;

          if (el.transactionHistory.isATrip) {
            completedTripCal = completedTripCal + 1;
            totalEarningsCal =
              totalEarningsCal + el.transactionHistory.trip.totalTripValue;
          } else {
            totalEarningsCal =
              totalEarningsCal + el.transactionHistory.trip.tripEarning;
          }
        }
      });

      response.totalIncome = totalEarningsCal;
      response.commissionIncome = commissionEarningsCal;
      response.CompletedTrips = completedTripCal;

      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });
};

/* agent dashboard */
exports.getDashboardDataByCompany = function (req, res) {
  var fromDate = new Date(req.params.from);
  var toDate = new Date(req.params.to);
  let companyCode = req.params.companyCode;

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

  var i = 0;

  var response = {
    CanceledTrips: 0,
    RegisteredDriveres: 0,
    pendingDrivers: 0,
    registeredVehicles: 0,
    pendingVehicles: 0,
    totalIncome: 0,
    commissionIncome: 0,
    CompletedTrips: 0,
  };

  //canceled dispatch trips
  Dispatch.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                status: "canceled",
              },
            ],
          },
          {
            recordedTime: {
              $gte: fromDate,
              $lt: toDate,
            },
          },
          {
            companyCode: { $exists: true },
            companyCode: companyCode,
          },
        ],
      },
    },
  ]).exec(function (err, result) {
    if (err) {
      // res.status(500).send(err)
      i++;
    } else {
      response.CanceledTrips = response.CanceledTrips + result.length;
      // response.CanceledTrips = result.length;
      i++;
      if (i === 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  //canceled trips
  Trip.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                status: "canceled",
              },
            ],
          },
          {
            recordedTime: {
              $gte: fromDate,
              $lt: toDate,
            },
          },
          {
            companyCode: { $exists: true },
            companyCode: companyCode,
          },
        ],
      },
    },
  ]).exec(function (err, result1) {
    if (err) {
      // res.status(500).send(err)
      i++;
    } else {
      response.CanceledTrips = response.CanceledTrips + result1.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  //Approved drivers
  Driver.aggregate([
    {
      $match: {
        $and: [
          {
            companyCode: { $exists: true },
            companyCode: companyCode,
          },
          {
            isApproved: true,
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
  ]).exec(function (err, drivers) {
    if (err) {
      // res.status(500).json({
      //     message: 'Internel error'
      // });
      i++;
    } else {
      response.RegisteredDriveres = drivers.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  //pending drivres
  Driver.aggregate([
    {
      $match: {
        $and: [
          {
            isApproved: false,
          },
          {
            recordedTime: {
              $gte: fromDate,
              $lt: toDate,
            },
          },
          {
            companyCode: { $exists: true },
            companyCode: companyCode,
          },
        ],
      },
    },
  ]).exec(function (err, drivers) {
    if (err) {
      // res.status(500).json({
      //     message: 'Internel error'
      // });
      i++;
    } else {
      response.pendingDrivers = drivers.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  // approved vehicles
  Vehicle.aggregate([
    {
      $match: {
        $and: [
          {
            isApproved: true,
          },
          {
            recordedTime: {
              $gte: fromDate,
              $lt: toDate,
            },
          },
          {
            companyCode: { $exists: true },
            companyCode: companyCode,
          },
        ],
      },
    },
  ]).exec(function (err, vehicles) {
    if (err) {
      // res.status(500).json({
      //     message: 'internel error'
      // });
      i++;
    } else {
      response.registeredVehicles = vehicles.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  // pending vehicles
  Vehicle.aggregate([
    {
      $match: {
        $and: [
          {
            isApproved: false,
          },
          {
            recordedTime: {
              $gte: fromDate,
              $lt: toDate,
            },
          },
          {
            companyCode: { $exists: true },
            companyCode: companyCode,
          },
        ],
      },
    },
  ]).exec(function (err, vehicles) {
    if (err) {
      // res.status(500).json({
      //     message: 'internel error'
      // });
      i++;
    } else {
      response.pendingVehicles = vehicles.length;
      i++;
      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });

  AgentWallet.aggregate(
    {
      $match: {
        companyCode: { $exists: true },
        companyCode: companyCode,
      },
    },
    {
      $unwind: "$transactionHistory",
    },
    {
      $match: {
        $and: [
          {
            "transactionHistory.dateTime": {
              $gte: fromDate,
              $lt: toDate,
            },
          },
        ],
      },
    }
  ).exec(function (err, result) {
    if (err) {
      i++;
    } else {
      i++;
      var totalEarningsCal = 0;
      var commissionEarningsCal = 0;
      var completedTripCal = 0;

      result.forEach((el) => {
        if (el.transactionHistory.trip != null) {
          commissionEarningsCal =
            commissionEarningsCal + el.transactionHistory.trip.tripEarning;

          if (el.transactionHistory.isATrip) {
            completedTripCal = completedTripCal + 1;
            totalEarningsCal =
              totalEarningsCal + el.transactionHistory.trip.totalTripValue;
          } else {
            totalEarningsCal =
              totalEarningsCal + el.transactionHistory.trip.tripEarning;
          }
        }
      });

      response.totalIncome = totalEarningsCal;
      response.commissionIncome = commissionEarningsCal;
      response.CompletedTrips = completedTripCal;

      if (i == 7) {
        res.status(200).json({
          message: "success",
          content: response,
        });
      }
    }
  });
};

exports.getCompanyWallet = function (req, res) {
  console.log("######### admin : getCompanyWallet #########");

  var fromDate = new Date(req.params.from);
  var toDate = new Date(req.params.to);

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

  CompanyWallet.aggregate(
    {
      $unwind: "$transactionHistory",
    },
    {
      $lookup: {
        from: "dispatches",
        localField: "transactionHistory.trip.tripId",
        foreignField: "_id",
        as: "tripdataDispatch",
      },
    },
    {
      $lookup: {
        from: "roadpickuptrips",
        localField: "transactionHistory.trip.tripId",
        foreignField: "_id",
        as: "tripdataRoadpickup",
      },
    },
    {
      $lookup: {
        from: "trips",
        localField: "transactionHistory.trip.tripId",
        foreignField: "_id",
        as: "tripdataTrip",
      },
    },
    {
      $match: {
        $and: [
          {
            companyType: { $eq: "master" },
          },
          {
            "transactionHistory.dateTime": {
              $gte: fromDate,
              $lt: toDate,
            },
          },
        ],
      },
    },
    {
      $sort: { "transactionHistory.dateTime": -1 },
    }
  ).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      var totalEarningsCal = 0;

      result.forEach((el) => {
        if (el.transactionHistory.trip != null) {
          totalEarningsCal =
            totalEarningsCal + el.transactionHistory.trip.tripEarning;
        }
      });

      res.status(200).json({
        companyWallet: result,
        totalEarnings: totalEarningsCal,
      });

      // res.status(200).json({
      //     content: result
      // })
    }
  });
};

// exports.getCompanyWalletpagination = function (req, res) {
//     var fromDate = new Date(req.params.from);
//     var toDate = new Date(req.params.to);

//     CompanyWallet.aggregate(
//         {
//             "$unwind": "$transactionHistory"
//         },
//         {
//             $lookup: {
//                 from: "dispatches",
//                 localField: "transactionHistory.trip.tripId",
//                 foreignField: "_id",
//                 as: "tripdataDispatch"
//             }
//         },
//         {
//             $lookup: {
//                 from: "roadpickuptrips",
//                 localField: "transactionHistory.trip.tripId",
//                 foreignField: "_id",
//                 as: "tripdataRoadpickup"
//             }
//         },
//         {
//             $lookup: {
//                 from: "trips",
//                 localField: "transactionHistory.trip.tripId",
//                 foreignField: "_id",
//                 as: "tripdataTrip"
//             }
//         },
//         {
//             $match: {
//                 $and: [
//                     {
//                         'transactionHistory.dateTime': {
//                             $gte: fromDate,
//                             $lt: toDate
//                         }
//                     }
//                 ],
//             },
//         })
//         .exec(function (err, result) {
//             if (err) {
//                 res.status(500).send(err)
//             } else {

//                 var totalEarningsCal = 0

//                 result.forEach(el => {
//                     if (el.transactionHistory.trip != null) {
//                         totalEarningsCal = totalEarningsCal + el.transactionHistory.trip.tripEarning;
//                     }
//                 });

//                 res.status(200).json({
//                     companyWallet: result,
//                     totalEarnings: totalEarningsCal,
//                 })

//                 // res.status(200).json({
//                 //     content: result
//                 // })
//             }
//         })
// }

exports.getCompanyWalletpagination = function (req, res) {
  var fromDate = new Date(req.params.from);
  var toDate = new Date(req.params.to);

  var pageNo = req.params.pageNo;
  var paginationCount = 15;
  var responseData;
  var param = req.params.param;

  CompanyWallet.aggregate(
    {
      $unwind: "$transactionHistory",
    },
    {
      $lookup: {
        from: "dispatches",
        localField: "transactionHistory.trip.tripId",
        foreignField: "_id",
        as: "tripdataDispatch",
      },
    },
    {
      $lookup: {
        from: "roadpickuptrips",
        localField: "transactionHistory.trip.tripId",
        foreignField: "_id",
        as: "tripdataRoadpickup",
      },
    },
    {
      $lookup: {
        from: "trips",
        localField: "transactionHistory.trip.tripId",
        foreignField: "_id",
        as: "tripdataTrip",
      },
    },
    {
      $match: {
        $and: [
          {
            "transactionHistory.dateTime": {
              $gte: fromDate,
              $lt: toDate,
            },
          },
          {
            [param]: { $regex: req.params.text },
          },
        ],
      },
    }
  )
    .sort({ "transactionHistory.dateTime": -1 })
    .exec(function (err, result) {
      if (err) {
        res.status(500).send(err);
      } else {
        var totalEarningsCal = 0;

        result.forEach((el) => {
          if (el.transactionHistory.trip != null) {
            totalEarningsCal =
              totalEarningsCal + el.transactionHistory.trip.tripEarning;
          }
        });

        responseData = result.slice(
          (pageNo - 1) * paginationCount,
          pageNo * paginationCount
        );

        res.status(200).json({
          companyWallet: responseData,
          totalEarnings: totalEarningsCal,
          noOfPages: result / paginationCount,
          noOfRecords: result.length,
        });

        // res.status(200).json({
        //     content: result
        // })
      }
    });
};

/* agent wallet data */
exports.getCompanyWalletById = function (req, res) {
  console.log("######### admin : getCompanyWallet #########");

  var fromDate = new Date(req.body.from);
  var toDate = new Date(req.body.to);

  if (req.body.from === "undefined" && req.body.to === "undefined") {
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

  AgentWallet.aggregate(
    {
      $unwind: "$transactionHistory",
    },
    {
      $lookup: {
        from: "dispatches",
        localField: "transactionHistory.trip.tripId",
        foreignField: "_id",
        as: "tripdataDispatch",
      },
    },
    {
      $lookup: {
        from: "roadpickuptrips",
        localField: "transactionHistory.trip.tripId",
        foreignField: "_id",
        as: "tripdataRoadpickup",
      },
    },
    {
      $lookup: {
        from: "trips",
        localField: "transactionHistory.trip.tripId",
        foreignField: "_id",
        as: "tripdataTrip",
      },
    },
    {
      $match: {
        $and: [
          {
            agentId: req.body.agentId,
          },
          {
            "transactionHistory.dateTime": {
              $gte: fromDate,
              $lt: toDate,
            },
          },
        ],
      },
    },
    {
      $sort: { "transactionHistory.dateTime": -1 },
    }
  ).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      var totalEarningsCal = 0;

      result.forEach((el) => {
        if (el.transactionHistory.trip != null) {
          totalEarningsCal =
            totalEarningsCal + el.transactionHistory.trip.tripEarning;
        }
      });

      res.status(200).json({
        companyWallet: result,
        totalEarnings: totalEarningsCal,
      });

      // res.status(200).json({
      //     content: result
      // })
    }
  });
};

exports.gettripDataByTripId = function (req, res) {
  if (req.params.transactionType == "trip") {
    Trip.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }).exec(
      function (err, data) {
        if (err) {
          console.log("####### error occured" + err);
          res.status(400).send("error");
        } else {
          res.json({
            message: "success",
            details: "get data Successfully",
            content: data,
          });
        }
      }
    );
  } else if (req.params.transactionType == "roadPickup") {
    RoadPickup.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }).exec(
      function (err, data) {
        if (err) {
          console.log("####### error occured" + err);
          res.status(400).send("error");
        } else {
          res.json({
            message: "success",
            details: "get data Successfully",
            content: data,
          });
        }
      }
    );
  } else if (req.params.transactionType == "dispatch") {
    Dispatch.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }).exec(
      function (err, data) {
        if (err) {
          console.log("####### error occured" + err);
          res.status(400).send("error");
        } else {
          res.json({
            message: "success",
            details: "get data Successfully",
            content: data,
          });
        }
      }
    );
  } else if (req.params.transactionType == "other") {
  }
};

exports.changeAndroidDriverVersion = function (req, res) {
  var newValues = {
    $set: {
      androidAppVersion: req.params.version,
    },
  };

  Settings.update({}, newValues, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: "success" });
    }
  });
};

exports.changeAndroidPassengerVersion = function (req, res) {
  var newValues = {
    $set: {
      androidUserAppVersion: req.params.version,
    },
  };

  Settings.update({}, newValues, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: "success" });
    }
  });
};

exports.changeIosPassengerVersion = function (req, res) {
  var newValues = {
    $set: {
      iosUserAppVersion: req.params.version,
    },
  };

  Settings.update({}, newValues, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: "success" });
    }
  });
};

/* author : ghost */
exports.getDriverInfoById = function (req, res) {
  Driver.find({
    _id: req.body.id,
  }).exec(function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (data != null) {
        res.status(200).json({
          message: "success",
          content: data,
        });
      } else {
        res.status(400).json({
          message: "failed!",
          details: "Driver not found",
        });
      }
    }
  });
};

// admin get all agents //
exports.getAllAgents = function (req, res) {
  console.log("############# admin : getAllAgents #############");
  Admin.find({
    companyType: "agent",
  })
    .sort({ recordedTime: -1 })
    .exec(function (err, agents) {
      if (err) {
        res.status(500).json({
          message: "internel error",
        });
      } else {
        if (agents.length > 0) {
          res.status(200).json({
            message: "success",
            content: agents,
          });
        } else {
          res.status(404).json({
            message: "No agents found",
          });
        }
      }
    });
};

exports.getDriverAllInfoById = function (req, res) {
  console.log("########## admin : getDriverAllInfoById ##########");

  if (req.body.driverId == null) {
    res.status(400).json({
      message: "Invalid driver id",
    });
  } else {
    Driver.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.body.driverId),
          //'isApproved': true
        },
      },
      {
        $lookup: {
          from: "dispatchers",
          localField: "_id",
          foreignField: "dispatcherId",
          as: "dispatcher",
        },
      },
      {
        $lookup: {
          from: "driverwallets",
          localField: "_id",
          foreignField: "driverId",
          as: "wallet",
        },
      },
      {
        $project: {
          otpPin: 0,
          saltSecret: 0,
          otpTime: 0,
          "dispatcher.dispatcherCode": 0,
          //'wallet.transactionHistory' : 0
        },
      },
    ]).exec(function (err, driver) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (driver != null) {
          Vehicle.findOne({
            //_id: req.body.vehicleId,
            isApproved: true,
            isEnable: true,
            driverInfo: {
              $elemMatch: {
                driverId: req.body.driverId,
                isEnableDriver: true,
              },
            },
          }).exec(function (error, vehicle) {
            if (error) {
              res.status(500).send(error);
            } else {
              if (vehicle != null) {
                VehicleCategory.find({
                  isEnable: true,
                  categoryName: vehicle.vehicleCategory,
                  // "subCategory.subCategoryName": vehicle.vehicleSubCategory
                }).exec(function (err, category) {
                  if (category == null || category.length == 0) {
                    // res.status(400).json({
                    //     message: 'failed',
                    //     details: "No data found",
                    //     status: "failed"
                    // });

                    res.status(203).json({
                      message: "Vehicle is not available",
                      content1: driver,
                      content2: vehicle,
                      subCatData: null,
                    });
                  } else {
                    var subCatData1 = category[0].subCategory.filter(
                      (el) => el.subCategoryName === vehicle.vehicleSubCategory
                    );

                    if (
                      subCatData1[0] &&
                      subCatData1[0].roadPickupPriceSelection
                    ) {
                      subCatData1[0].roadPickupPriceSelection = null;
                    }

                    if (
                      subCatData1[0] &&
                      subCatData1[0].priceSelection != undefined
                    ) {
                      subCatData1[0].priceSelection = null;
                    }

                    //subCatData1[0].roadPickupPriceSelection = null;
                    //subCatData1[0].priceSelection = null;
                    var subCatData = subCatData1[0];
                    res.status(200).json({
                      message: "Driver and Vehicel Enabled!",
                      content1: driver,
                      content2: vehicle,
                      subCatData,
                    });
                  }
                });
              } else {
                res.status(203).json({
                  message: "Vehicle is not available",
                  content1: driver,
                  content2: null,
                  subCatData: null,
                });
              }
            }
          });
        } else {
          res.status(202).json({
            message: "Driver is not approved",
          });
        }
      }
    });
  }
};

exports.getAgentDataById = function (req, res) {
  console.log("###### admin : getAgentDataById #######");

  var agentId = new ObjectId(req.body.agentId);

  // Agent.findOne({
  //     "_id": new ObjectId(req.body.agentId),
  // })
  // .select({
  //     " password": 0
  // })

  Admin.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.body.agentId),
        companyType: "agent",
      },
    },
    {
      $lookup: {
        from: "agentwallets",
        localField: "_id",
        foreignField: "agentId",
        as: "wallet",
      },
    },
    {
      $project: {
        password: 0,
        "wallet.transactionHistory": 0,
      },
    },
  ]).exec(function (err, agent) {
    if (err) {
      console.log("####### error occured" + err);
      res.send("error");
    } else {
      if (agent !== null) {
        console.log(
          "####################### not an null data ##########################"
        );

        // let address = {
        //     address: agent.address.address,
        //     street: agent.address.street,
        //     city: agent.address.city,
        //     //zipcode: admin.address.zipcode,
        //     //country: admin.address.country
        // }

        // let agentInfo = {
        //     companyCode: agent.companyCode,
        //     companyName: agent.companyName,
        //     companyType: agent.companyType,
        //     ownerName: agent.ownerName,
        //     email: agent.agentEmail,
        //     nic: agent.nic,
        //     mobile: agent.agentContactNumber,
        //     address: address,
        //     status: agent.status,
        //     isEnable: agent.isEnable,
        //     isVerified: agent.isVerified,
        //     isLoggedIn: agent.isLoggedIn,
        //     lastLogin: agent.lastLogin,
        //     role: agent.role,
        //     recordedTime: agent.recordedTime
        // }

        // console.log(agentInfo);

        // res.status(200).json({
        //     message: 'success',
        //     details: "agent data retrived successfully",
        //     content: agentInfo
        // });

        res.status(200).json({
          message: "success",
          details: "agent data retrived successfully",
          content: agent,
        });
      } else {
        console.log(
          "####################### null data ##########################"
        );
        res.status(403).json({
          message: "failed",
          details: "agent not found",
        });
      }
    }
  });
};

exports.getAgentTransactionDataById = function (req, res) {
  console.log("###### admin : getAgentTransactionDataById #######");

  var agentId = new ObjectId(req.body.agentId);

  AgentWallet.findOne({
    agentId: new ObjectId(req.body.agentId),
  })
    .sort({ "transactionHistory.dateTime": -1 })
    .exec(function (err, wallet) {
      if (err) {
        console.log("####### error occured" + err);
        res.send("error");
      } else {
        if (wallet != null) {
          console.log(
            "####################### not an null data ##########################"
          );

          res.status(200).json({
            message: "success",
            details: "wallet data retrived successfully",
            content: wallet,
          });
        } else {
          console.log(
            "####################### null data ##########################"
          );
          res.status(403).json({
            message: "failed",
            details: "wallet id not found",
          });
        }
      }
    });
};

exports.getAgentTransactionDataById = function (req, res) {
  console.log("###### admin : getAgentTransactionDataById #######");

  var agentId = new ObjectId(req.body.agentId);

  AgentWallet.findOne({
    agentId: new ObjectId(req.body.agentId),
  })
    .sort({ "transactionHistory.dateTime": -1 })
    .exec(function (err, wallet) {
      if (err) {
        console.log("####### error occured" + err);
        res.send("error");
      } else {
        if (wallet != null) {
          console.log(
            "####################### not an null data ##########################"
          );

          res.status(200).json({
            message: "success",
            details: "wallet data retrived successfully",
            content: wallet,
          });
        } else {
          console.log(
            "####################### null data ##########################"
          );
          res.status(403).json({
            message: "failed",
            details: "wallet id not found",
          });
        }
      }
    });
};

exports.getAgentDriversDataByCode = function (req, res) {
  console.log("############# admin : getAgentDriversDataByCode #############");
  Driver.find({
    companyCode: req.body.companyCode,
  })
    .select({
      otpPin: 0,
      otpTime: 0,
      saltSecret: 0,
    })
    .exec(function (err, drivers) {
      if (err) {
        res.status(500).json({
          message: "internel error",
        });
      } else {
        if (drivers.length > 0) {
          res.status(200).json({
            message: "drivers retrived successfully",
            content: drivers,
          });
        } else {
          res.status(404).json({
            message: "drivers not found",
          });
        }
      }
    });
};

//recharge wallet amount of agent
exports.rechargeAgentWalletById = async function (req, res) {
  console.log("############# admin : rechargeAgentWalletById #############");

  var totalRechargeAmount = req.body.rechargeAmount;
  var totalBonusAmount = 0;

  if (req.body.agentBonus) {
    /* check agent promotions */
    var promoCode = null;
    var promotions = await PromotionController.checkPromotions(
      "agent",
      "FTBFA"
    );

    if (promotions && promotions.length > 0) {
      promotions.forEach((item) => {
        promoCode = item.promocode;
        totalBonusAmount =
          totalBonusAmount + (item.commission * req.body.rechargeAmount) / 100;
      });
    }

    totalRechargeAmount = totalRechargeAmount + totalBonusAmount;
    console.log(totalRechargeAmount);
    console.log("hello");

    var promoLog = {
      promocode: promoCode,
      value: totalBonusAmount,
      isActive: false,
    };

    var rechargeLog = {
      dateTime: new Date(),
      amount: totalRechargeAmount,
      method: req.body.rechargeMethod,
      description: req.body.rechargeDescription,
    };

    var newVals = {
      $inc: {
        totalWalletPoints: totalRechargeAmount,
        bonusAmount: totalBonusAmount,
      },
      $push: {
        rechargeHistory: rechargeLog,
        promocode: promoLog,
      },
    };
    AgentWallet.findOneAndUpdate(
      { agentId: req.body.agentId },
      newVals,
      function (err, wallet) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json({ message: wallet });
        }
      }
    );
  } else {
    var rechargeLog = {
      dateTime: new Date(),
      amount: totalRechargeAmount,
      method: req.body.rechargeMethod,
      description: req.body.rechargeDescription,
    };

    var newVals = {
      $inc: {
        totalWalletPoints: totalRechargeAmount,
        bonusAmount: totalBonusAmount,
      },
      $push: {
        rechargeHistory: rechargeLog,
      },
    };

    AgentWallet.findOneAndUpdate(
      { agentId: req.body.agentId },
      newVals,
      function (err, wallet) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json({ message: wallet });
        }
      }
    );
  }
};

/* delete agent and agent wallet */
