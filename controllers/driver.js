"use strict";

var express = require("express");
var router = express.Router();
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var Driver = require("../models/driver");
var Vehicle = require("../models/vehicle");
var User = require("../models/user");
var VehicleCategory = require("../models/vehiclecategory");
var VehicleTracking = require("../models/vehicletracking");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var imageUpload = require("./imageUpload");
var driverRegEmail = require("../emailTemplate/driverRegister");
var notification = require("../services/adminNotifications");
var sendSms = require("../services/sendSms");
var otp = require("../services/randomnum");
var DriverWallet = require("../models/driverwallet");
var Setting = require("../models/setting");
var DispatcherWallet = require("../models/dispatcherwallet");
var Dispatch = require("../models/dispatch");
var config = require("../config");
var Common = require("../services/common");

require("dotenv").config();

app.use(cors());
router.use(cors());

//support on x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

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

app.set("views", path.join(__dirname, "../views/"));

exports.driver = function (req, res) {
  console.log("###### Driver ######");
  res.json({
    status: "Driver",
  });
};

/* ### Signup / Register ### */
exports.registerDriver = function (req, res) {
  console.log("###### Driver register ######");
  console.log("Request: ", req.body);
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
        res.send("error");
      } else {
        if (drivers !== null) {
          console.log(
            "####################### not an null data : Driver already exist ##########################"
          );
          res.status(208).json({
            message: "failed",
            details: "email or mobile already registered!",
            status: "signup_failed",
          });
        } else {
          console.log(
            "####################### null data ##########################"
          );
          console.log(req.body);

          /* check agent companies by company code*/
          if (
            req.body.companyCode &&
            req.body.companyCode != process.env.MASTER_COMPANY
          ) {
            Common.checkCompanyInfo("agent", req.body.companyCode)
              .then((val) => {
                if (!val) {
                  res.status(203).json({
                    message: "driver company code not found",
                    details: "driver registered failed",
                  });
                } else {
                  var driver = new Driver();

                  driver.firstName = req.body.firstName;
                  driver.lastName = req.body.lastName;
                  driver.email = req.body.email;
                  driver.otpPin = otp.otpGen();
                  driver.otpTime = new Date();
                  driver.nic = req.body.nic;
                  driver.birthday = new Date(req.body.birthday);
                  driver.mobile = req.body.mobile;
                  driver.gender = req.body.gender;

                  driver.companyCode = val.companyCode;
                  driver.company = val.companyName;

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
                  let salt = bcrypt.hashSync(req.body.email, 5);
                  driver.saltSecret = salt.replace(/[^a-zA-Z ]/g, "");
                  driver.driverCode =
                    process.env.APP_SHORT_NAME + "" + otp.generateRefToken();
                  driver.accNumber = req.body.accNumber;

                  driver.save(async function (err) {
                    if (err) {
                      console.log(
                        "driver : registerDriver: driver data save error :" +
                          err
                      );
                      res.status(500).send(err);
                    } else {
                      let driv = {
                        id: driver._id,
                        name: driver.firstName + " " + driver.lastName,
                      };

                      /* create new wallet for driver */
                      var wallet = new DriverWallet();
                      wallet.driverId = driver._id;

                      wallet.save(function (err, wallet) {
                        if (err) {
                          console.log(
                            "driver : registerDriver: wallet save error :" + err
                          );
                          return res.status(500).send(err);
                        } else {
                          imageUpload.uploadImages(
                            req.files,
                            driver._id,
                            Driver,
                            "drivers"
                          );
                          sendSms.sendSms(req.body.mobile, driver.otpPin);
                          //driverRegEmail.driverRegEmail(req.body.email, driver.saltSecret);
                          notification.driverRegToAdmin(driv);

                          res.status(200).json({
                            message: "success",
                            details: "Signup successfully",
                          });
                        }
                      });
                    }
                  });
                }
              })
              .catch((err) => {
                console.log("driver company code not found: " + err);
              });
          } else {
            var driver = new Driver();

            driver.firstName = req.body.firstName;
            driver.lastName = req.body.lastName;
            driver.email = req.body.email;
            driver.otpPin = otp.otpGen();
            driver.otpTime = new Date();
            driver.nic = req.body.nic;
            driver.birthday = new Date(req.body.birthday);
            driver.mobile = req.body.mobile;
            driver.gender = req.body.gender;

            driver.companyCode = process.env.MASTER_COMPANY;

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
            let salt = bcrypt.hashSync(req.body.email, 5);
            driver.saltSecret = salt.replace(/[^a-zA-Z ]/g, "");
            driver.driverCode =
              process.env.APP_SHORT_NAME + "" + otp.generateRefToken();
            driver.accNumber = req.body.accNumber;

            driver.save(async function (err) {
              if (err) {
                console.log(
                  "driver : registerDriver: driver data save error :" + err
                );
                res.status(500).send(err);
              } else {
                let driv = {
                  id: driver._id,
                  name: driver.firstName + " " + driver.lastName,
                };

                /* create new wallet for driver */
                var wallet = new DriverWallet();
                wallet.driverId = driver._id;

                wallet.save(function (err, wallet) {
                  if (err) {
                    console.log(
                      "driver : registerDriver: wallet save error :" + err
                    );
                    return res.status(500).send(err);
                  } else {
                    imageUpload.uploadImages(
                      req.files,
                      driver._id,
                      Driver,
                      "drivers"
                    );
                    sendSms.sendSms(req.body.mobile, driver.otpPin);
                    //driverRegEmail.driverRegEmail(req.body.email, driver.saltSecret);
                    notification.driverRegToAdmin(driv);

                    res.status(200).json({
                      message: "success",
                      details: "Signup successfully",
                    });
                  }
                });
              }
            });
          }
        }
      }
    });
  } else {
    res.status(203).json({
      message: "driver images are missing",
    });
  }
};

// ### Driver Login using Otp ###
exports.otpLogin = function (req, res) {
  console.log("driver otp login");

  Driver.findOne({
    mobile: req.body.mobile,
  }).exec(function (err, driver) {
    if (err) {
      console.log("driver otp login " + 204);
      return res.status(204).json({
        message: "error",
        details: "Internal db error",
        content: err,
      });
      // return res.status(204).json({
      //     "status": 0,
      //     "message": 'Driver not found',
      //     "__data": {
      //         "errors": err
      //     }
      // });
    } else {
      if (driver !== null) {
        if (
          new Date().getTime() - new Date(driver.otpTime).getTime() >
          300000
        ) {
          console.log("driver otp login " + 209);
          return res.status(209).json({
            message: "error",
            details: "OTP timeout",
            content: "OTP timeout",
          });
        } else if (req.body.pin !== driver.otpPin) {
          console.log("driver otp login " + 210);
          return res.status(210).json({
            message: "error",
            details: "OTP is incorrect",
            content: "OTP is incorrect",
          });
        } else if (req.body.pin > 999) {
          var newValues = {
            $set: {
              otpPin: 0,
              contactNoConfirm: true,
            },
          };
          Driver.findByIdAndUpdate(
            driver._id,
            newValues,
            function (err, result) {
              if (err) {
                console.log("driver otp login " + 500);
                return res.status(500).json({
                  message: "error",
                  details: "OTP pin update db error",
                  content: res,
                });
                // return res.status(500).json({
                //     "status": 0,
                //     "message": 'OTP pin update db error',
                //     "__data": {
                //         "errors": res
                //     }
                // });
              } else {
                /* check ratings */
                var driverRate = null;
                var ratingList = [];

                if (driver.ratings && driver.ratings.length > 0) {
                  var sum = 0;
                  driver.ratings.forEach((el) => {
                    console.log(el.feedback);
                    sum = sum + el.rate;
                    ratingList.push({
                      rate: el.rate,
                      feedback: el.feedback,
                    });
                  });

                  driverRate = sum / driver.ratings.length;
                }

                /* check driver code */
                var driverCode = null;

                if (driver.driverCode) {
                  driverCode = driver.driverCode;
                }

                /* check company code */
                var companyCode = null;

                if (driver.companyCode) {
                  companyCode = driver.companyCode;
                }

                let driv = {
                  id: driver._id,
                  firstname: driver.firstName,
                  lastname: driver.lastName,
                  driverPic: driver.driverPic,
                  birthday: driver.birthday,
                  address: driver.address,
                  contactNo: driver.mobile,
                  nic: driver.nic,
                  gender: driver.gender,
                  email: driver.email,
                  ratingsList: ratingList,
                  rate: driverRate,
                  driverCode: driverCode,
                  companyCode: companyCode,
                  accNumber: driver.accNumber,
                };

                if (driver.isApproved) {
                  console.log("driver otp login " + 200);
                  return res.status(200).json({
                    message: "signedin",
                    details: "Login successfully",
                    content: driv,
                    token: jwt.sign(
                      {
                        email: driver.email,
                        _id: driver._id,
                      },
                      "RESTFULAPIs"
                    ),
                  });
                  // return res.status(200).json({
                  //     "status": 1,
                  //     "message": 'Login successfully',
                  //     "__data": {
                  //         "errors": false,
                  //         "token": jwt.sign({
                  //             email: driver.email,
                  //             _id: driver._id
                  //         }, 'RESTFULAPIs'),
                  //         "content": driv,
                  //     }
                  // });
                } else {
                  console.log("driver otp login " + 202);
                  return res.status(202).json({
                    message: "notapproved",
                    details: "Driver is not Approved",
                    content: driv,
                  });
                  // return res.status(202).json({
                  //     "status": 0,
                  //     "message": 'Driver is not Approved',
                  //     "__data": {
                  //         "errors": "Pending driver",
                  //         "content": driv,
                  //     }
                  // })
                }
              }
            }
          );
        }
      } else {
        console.log("driver otp login " + 204);
        return res.status(204).json({
          message: "error",
          details: "Driver not found",
          content: "Driver not found",
        });
      }
    }
  });
};

//Send otp to driver when time out
exports.getOtp = function (req, res) {
  Driver.findOne({
    mobile: req.body.mobile,
  }).exec(function (err, driver) {
    if (err) {
      res.status(500).json({
        message: "internel error",
      });
    } else {
      if (driver !== null) {
        console.log("## driver not null ##");
        if (new Date().getTime() - new Date(driver.otpTime).getTime() < 30000) {
          res.status(202).json({
            message: "Too early to request",
          });
        } else {
          var pin = otp.otpGen();
          if (driver.otpPin === 0 || driver.otpPin > 999) {
            var newValues = {
              $set: {
                otpPin: pin,
                otpTime: new Date(),
              },
            };
            Driver.findOneAndUpdate(
              {
                mobile: req.body.mobile,
              },
              newValues,
              function (err, result) {
                if (err) {
                  return res.status(500).json({
                    message: "Internal server error",
                  });
                } else {
                  sendSms.sendSms(req.body.mobile, pin);
                  return res.status(200).json({
                    message: "otp send success",
                  });
                }
              }
            );
          } else {
            res.status(500).json({
              message: "internel error",
            });
          }
        }
      } else {
        res.status(204).json({
          message: "Driver not found",
        });
      }
    }
  });
};

// send driver details to mobile no
exports.sendOtp = function (req, res) {
  Driver.findOne({
    mobile: req.body.mobile,
  }).exec(function (err, driver) {
    if (err) {
      res.status(500).json({
        message: "internel error",
      });
    } else {
      if (driver !== null) {
        var pin = otp.otpGen();
        if (driver.otpPin === 0 || driver.otpPin > 999) {
          var newValues = {
            $set: {
              otpPin: pin,
              otpTime: new Date(),
            },
          };
          Driver.findOneAndUpdate(
            {
              mobile: req.body.mobile,
            },
            newValues,
            function (err, result) {
              if (err) {
                return res.status(500).json({
                  message: "Internal server error",
                });
              } else {
                let driv = {
                  id: driver._id,
                  firstname: driver.firstName,
                  lastname: driver.lastName,
                  driverPic: driver.driverPic,
                };
                sendSms.sendSms(req.body.mobile, pin);
                return res.status(200).json({
                  message: "otp send success",
                  content: driv,
                });
              }
            }
          );
        } else {
          res.status(500).json({
            message: "internel error",
          });
        }
      } else {
        res.status(204).json({
          message: "signup",
          details: "Driver not registered! Please Signup",
          content: "Driver not registered! Please Signup",
        });
      }
    }
  });
};

// ConfirmEmail of Driver
exports.confirmEmail = function (req, res) {
  Driver.findOne({
    saltSecret: req.params.salt,
  }).exec(function (err, driver) {
    if (err) {
      res.status(500).json({
        message: "internel error",
      });
    }
    if (driver !== null) {
      if (driver.emailConfirm === false) {
        var newValues = {
          $set: {
            emailConfirm: true,
            saltSecret: null,
          },
        };
        Driver.findOneAndUpdate(
          {
            saltSecret: req.params.salt,
          },
          newValues,
          function (err, result) {
            if (err) {
              return res.status(500).json({
                message: "Internal server error",
              });
            } else {
              //return res.sendFile(path.join(__dirname,'../views/index.ejs'))
              // return res.status(200).json({
              //   message: 'Email confirmed'
              // });
              //return res.redirect('../views/index.ejs');
              return res.render("index", {
                title: "Your Email is Confirmed.",
              });
            }
          }
        );
      } else {
        return res.status(409).json({
          message: "Email already confirmed",
        });
      }
    } else {
      return res.status(404).json({
        message: "Not found",
      });
    }
  });
};

//admin get approved drivers
exports.getApprovedDrivers = function (req, res) {
  Driver.aggregate([
    {
      $match: {
        isApproved: true,
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
      },
    },
  ]).exec(function (err, drivers) {
    if (err) {
      res.status(500).json({
        message: "Internel error",
      });
    } else {
      if (drivers.length > 0) {
        res.status(200).json({
          message: "Success!",
          content: drivers,
        });
      } else {
        res.status(404).json({
          message: "Not found Drivers",
        });
      }
    }
  });
};

//admin get approved drivers paginaation
exports.getapproveddriverspagination = function (req, res) {
  // var fromDate = new Date(req.params.from);
  // var toDate = new Date(req.params.to);
  var pageNo = req.body.pageNo;
  var paginationCount = req.body.paginationCount;
  var responseData;
  var param = req.body.param;

  /* filter by agent company */
  var companyCode = req.body.companyCode;

  // query.$match.$and[param] = req.body.text;

  Driver.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                isApproved: true,
              },
            ],
          },
          {
            [param]: { $regex: req.body.text },
          },
        ],
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
      },
    },
  ])
    .sort({ recordedTime: -1 })
    .exec(function (err, drivers) {
      if (err) {
        res.status(500).json({
          message: "Internel error",
        });
      } else {
        if (drivers.length > 0) {
          //############### pagination #####################
          responseData = drivers.slice(
            (pageNo - 1) * paginationCount,
            pageNo * paginationCount
          );
          //################################################
          console.log(drivers);
          res.status(200).json({
            message: "Success!",
            content: responseData,
            noOfPages: Math.ceil(drivers.length / paginationCount),
            noOfRecords: drivers.length,
          });
        } else {
          res.status(404).json({
            message: "Not found Drivers",
          });
        }
      }
    });
};

//agent get approved drivers paginaation
exports.getapproveddriverspaginationbycompany = function (req, res) {
  // var fromDate = new Date(req.params.from);
  // var toDate = new Date(req.params.to);
  var pageNo = req.body.pageNo;
  var paginationCount = req.body.paginationCount;
  var responseData;
  var param = req.body.param;

  /* filter by agent company */
  var companyCode = req.body.companyCode;

  // query.$match.$and[param] = req.body.text;

  Driver.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                isApproved: true,
              },
            ],
          },
          {
            [param]: { $regex: req.body.text },
          },
          {
            companyCode: { $exists: true },
            companyCode: companyCode,
          },
        ],
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
      },
    },
  ])
    .sort({ recordedTime: -1 })
    .exec(function (err, drivers) {
      if (err) {
        res.status(500).json({
          message: "Internel error",
        });
      } else {
        if (drivers.length > 0) {
          //############### pagination #####################
          responseData = drivers.slice(
            (pageNo - 1) * paginationCount,
            pageNo * paginationCount
          );
          //################################################
          console.log(drivers);
          res.status(200).json({
            message: "Success!",
            content: responseData,
            noOfPages: Math.ceil(drivers.length / paginationCount),
            noOfRecords: drivers.length,
          });
        } else {
          res.status(404).json({
            message: "Not found Drivers",
          });
        }
      }
    });
};

// admin enable driver //
exports.adminEnableDriver = function (req, res) {
  console.log("### in approve ###");
  Driver.findOne({
    _id: req.body.id,
  }).exec(function (err, driver) {
    if (err) {
      res.status(500).json({
        message: "Internel error",
      });
    } else {
      if (driver !== null) {
        if (driver.isApproved == true) {
          var newValues = {
            $set: {
              isEnable: req.body.isEnable,
            },
          };
          Driver.findByIdAndUpdate(
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
            message: "Driver is not approved",
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
exports.getEligibleDrivers = function (req, res) {
  Driver.find({
    isApproved: true,
    isEnable: true,
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
            message: "No elgible to approve",
          });
        }
      }
    });
};

// agent get drivers by company code //
exports.geteligibledriversbycompany = function (req, res) {
  console.log(req.params.companyCode);
  Driver.find({
    isApproved: true,
    isEnable: true,
    companyCode: req.params.companyCode,
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
          console.log(drivers);
          res.status(200).json({
            message: "success",
            content: drivers,
          });
        } else {
          res.status(404).json({
            message: "No elgible to approve",
          });
        }
      }
    });
};

exports.updateDriver = function (req, res) {
  console.log("Update Driver Request: ", req.body);
  console.log(req.body.lifeInsuranceExpiryDate);
  console.log(req.body.lifeInsuranceExpiryDate != "null");
  let newValues;
  if (req.body.lifeInsuranceExpiryDate != "null") {
    newValues = {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        nic: req.body.nic,
        birthday: req.body.birthday,
        mobile: req.body.mobile,
        gender: req.body.gender,
        "address.address": req.body.address,
        "address.street": req.body.street,
        "address.city": req.body.city,
        "address.zipcode": req.body.zipcode,
        "address.country": req.body.country,
        lifeInsuranceNo: req.body.lifeInsuranceNo,
        lifeInsuranceExpiryDate: req.body.lifeInsuranceExpiryDate,
        lifeInsuranceAmount: req.body.lifeInsuranceAmount,
        accNumber: req.body.accNumber,
      },
    };
  } else {
    newValues = {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        nic: req.body.nic,
        birthday: req.body.birthday,
        mobile: req.body.mobile,
        gender: req.body.gender,
        "address.address": req.body.address,
        "address.street": req.body.street,
        "address.city": req.body.city,
        "address.zipcode": req.body.zipcode,
        "address.country": req.body.country,
        lifeInsuranceNo: req.body.lifeInsuranceNo,
        // lifeInsuranceExpiryDate: req.body.lifeInsuranceExpiryDate,
        lifeInsuranceAmount: req.body.lifeInsuranceAmount,
        accNumber: req.body.accNumber,
      },
    };
  }

  Driver.findByIdAndUpdate(
    req.body.driverId,
    newValues,
    function (err, results) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: err,
        });
      } else {
        if (results != null) {
          console.log(results);
          imageUpload.uploadImagesCallback(
            req.files,
            req.body.driverId,
            Driver,
            "drivers",
            function (response) {
              console.log("############### Image Uploded #################");
            }
          );
          res.status(200).json({
            message: "success!",
          });
        } else {
          console.log(results);
          console.log(req.body.driverId);
          res.status(500).json({
            message: "fail!",
          });
        }
      }
    }
  );
};

exports.updateDriverProfile = function (req, res) {
  console.log("########### update driver profile ############");
  console.log("Update Driver Profile Request: ", req.body);
  Driver.findOne({
    _id: req.body.driverId,
  }).exec(function (err, driver) {
    if (err) {
      res.status(500).json({
        message: "Server Error",
      });
    } else {
      if (driver == null) {
        console.log(
          "####################### Cannot find driver ##########################"
        );
        res.status(400).send({
          message: "failed",
          details: "Driver not found",
          status: "driver update failed",
        });
      } else {
        /* check ratings */
        var driverRate = null;
        var ratingList = [];

        if (driver.ratings && driver.ratings.length > 0) {
          var sum = 0;
          driver.ratings.forEach((el) => {
            console.log(el.feedback);
            sum = sum + el.rate;
            ratingList.push({
              rate: el.rate,
              feedback: el.feedback,
            });
          });

          driverRate = sum / driver.ratings.length;
        }

        /* check driver code */
        var driverCode = null;

        if (driver.driverCode) {
          driverCode = driver.driverCode;
        }

        /* check company code */
        var companyCode = null;

        if (driver.companyCode) {
          companyCode = driver.companyCode;
        }

        let address = {
          city: req.body.city,
          district: req.body.district,
          province: req.body.province,
          country: req.body.country,
        };

        let returnValues = {
          id: req.body.driverId,
          firstname: req.body.firstName,
          lastname: req.body.lastName,
          driverPic: driver.driverPic,
          birthday: req.body.birthday,
          address: address,
          contactNo: req.body.mobile,
          nic: req.body.nic,
          gender: req.body.gender,
          email: req.body.email,
          ratingsList: ratingList,
          rate: driverRate,
          driverCode: driverCode,
          companyCode: companyCode,
          accNumber: req.body.accNumber,
        };

        var newValues = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          nic: req.body.nic,
          birthday: req.body.birthday,
          mobile: req.body.mobile,
          gender: req.body.gender,
          "address.city": req.body.city,
          "address.district": req.body.district,
          "address.province": req.body.province,
          "address.country": req.body.country,
          accNumber: req.body.accNumber,
        };

        Driver.update(
          {
            _id: req.body.driverId,
          },
          {
            $set: newValues,
          }
        ).exec(function (err, data) {
          if (err) {
            console.log(err);
            res.status(500).json({
              message: "failed",
              details: "Server Error!",
            });
          } else {
            res.status(200).json({
              message: "success",
              details: "Driver updated successfully",
              content: returnValues,
              // content: {
              //     'firstName': newValues.firstName,
              //     'lastName': newValues.lastName,
              //     'email': newValues.email,
              //     'nic': newValues.nic,
              //     'birthday': newValues.birthday,
              //     'mobile': newValues.mobile,
              //     'gender': newValues.gender,
              //     'address': {
              //         'city': req.body.city,
              //         'district': req.body.district,
              //         'province': req.body.province,
              //         'country': req.body.country,
              //     }
              // }
            });
          }
        });
      }
    }
  });
};

exports.deleteDriver = function (req, res) {
  Driver.findByIdAndRemove(req.body.driverId, function (err, results) {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: err,
      });
    } else {
      if (results != null) {
        console.log(results);

        res.status(200).json({
          message: "success!",
        });
      } else {
        console.log(results);
        console.log(req.body.driverId);
        res.status(500).json({
          message: "fail!",
        });
      }
    }
  });
};

exports.driverAddVehicle = function (req, res) {
  var vehicle = new Vehicle();

  vehicle.ownerInfo.ownerContactName = req.body.ownerContactName;
  vehicle.ownerInfo.ownerContactNumber = req.body.ownerContactNumber;
  vehicle.ownerInfo.ownerContactEmail = req.body.ownerContactEmail;

  /* old address data structure */
  vehicle.ownerInfo.address.address = req.body.address;
  vehicle.ownerInfo.address.street = req.body.street;
  vehicle.ownerInfo.address.zipcode = req.body.zipcode;

  /* new address data structure */
  vehicle.ownerInfo.address.country = req.body.country;
  vehicle.ownerInfo.address.province = req.body.province;
  vehicle.ownerInfo.address.district = req.body.district;
  vehicle.ownerInfo.address.city = req.body.city;

  vehicle.ownerInfo.isVerify = false;

  /* driver id */
  let info = {
    driverId: req.body.driverId,
    isEnableDriver: false,
  };

  vehicle.driverInfo.push(info);
  vehicle.vehicleRegistrationNo = req.body.vehicleRegistrationNo;
  vehicle.vehicleColor = req.body.vehicleColor;
  vehicle.vehicleBrandName = req.body.vehicleBrandName;
  vehicle.vehicleModel = req.body.vehicleModel;
  vehicle.passengerCapacity = req.body.passengerCapacity;
  vehicle.isApproved = false;

  vehicle.weightLimit = req.body.weightLimit;

  vehicle.save(function (err) {
    if (err) {
      console.log("#################### error occured #######################");
      console.log(err);
      //res.status(500).send(err);
      res.status(500).json({
        message: "failed",
        details: "Vehicle registration failed",
        content: err,
      });
    } else {
      console.log(vehicle._id);
      imageUpload.uploadImages(req.files, vehicle._id, Vehicle, "vehicles");
      res.status(200).json({
        message: "success",
        details: "Vehicle registered successfully",
      });
    }
  });
};

exports.getLatestAndroidVersion = function (req, res) {
  Setting.find({}, function (err, data) {
    if (err) {
      console.log("#################### error occured #######################");
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200).json({
        message: "success",
        androidAppVersion: data[0].androidAppVersion,
      });
    }
  });
};

exports.updateDriverImagesById = function (req, res) {
  if (req.files != null) {
    imageUpload.uploadImagesCallback(
      req.files,
      req.body.driverId,
      Driver,
      "drivers",
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

/* author : ghost */
exports.updateProfileImage = function (req, res) {
  console.log("########### update driver profile image ############");
  Driver.findOne({
    _id: req.body.driverId,
  }).exec(function (err, driver) {
    if (err) {
      res.status(500).json({
        message: "Server Error",
      });
    } else {
      if (driver == null) {
        console.log(
          "####################### Cannot find driver ##########################"
        );
        res.status(400).send({
          message: "failed",
          details: "Driver not found",
          status: "driver profile image update failed",
        });
      } else {
        if (req.files != null) {
          imageUpload.uploadProfileImageCallback(
            req.files,
            driver._id,
            Driver,
            "drivers",
            function (response, data) {
              console.log(response);
              res.status(200).json({
                message: "success",
                details: "Driver profile image updated successfully",
                url: response,
              });
            }
          );
        } else {
          res.status(500).json({
            message: "failed",
            details: "Driver profile image update failed!",
            content: "file not found",
          });
        }
      }
    }
  });
};

// exports.getVehicleDetails = function (req, res) {
//   Vehicle.aggregate([{
//       $match: {
//         'driverInfo.driverId': mongoose.Types.ObjectId(req.body.driverId),
//         'isApproved': true
//       }
//     }, {
//       $lookup: {
//         from: 'vehicletrackings',
//         let: {
//           vehicleId: '$_id'
//         },
//         pipeline: [{
//           $match: {
//             $expr: {
//               $and: [{
//                 $eq: ['$vehicleId', '$$vehicleId']
//               }]
//             }
//           }
//         }],
//         as: 'status'
//       }
//     }, {
//       $project: {
//         'ownerInfo': 0,
//         'status.vehicleInfo': 0,
//         'status.driverInfo': 0,
//         'status.currentLocation': 0
//       }
//     }])
//     .exec(function (err, result) {
//       if (err) {
//         res.status(500).json({
//           message: 'Internel error'
//         })
//       } else {
//         if (result.length > 0) {
//           res.status(200).json({
//             message: 'success!',
//             content: result
//           })
//         } else {
//           res.status(422).json({
//             message: 'bad data!'
//           })
//         }
//       }
//     })
// }

exports.getVehicleDetails = function (req, res) {
  Vehicle.find({
    $or: [
      {
        driverInfo: {
          $elemMatch: {
            driverId: req.body.driverId,
            isEnableDriver: true,
          },
        },
      },
      {
        $and: [
          {
            "driverInfo.driverId": req.body.driverId,
          },
          {
            driverInfo: {
              $not: {
                $elemMatch: {
                  isEnableDriver: {
                    $ne: false,
                  },
                },
              },
            },
          },
        ],
      },
    ],
    isApproved: true,
    isEnable: true,
  }).exec(function (err, result) {
    if (err) {
      res.send(err);
    } else {
      if (result.length > 0) {
        res.status(200).json({
          message: "success!",
          content: result,
        });
      } else {
        res.status(204).json();
      }
    }
  });
};

/* choose vehicle by driver */
exports.driverSelectVehicle = function (req, res) {
  console.log("############ driver: driverSelectVehicle ###########");
  console.log(req.body.driverId);
  console.log(req.body.vehicleId);

  Vehicle.updateMany(
    {
      "driverInfo.driverId": req.body.driverId,
    },
    {
      $set: {
        "driverInfo.$.isEnableDriver": false,
      },
    }
  ).exec(function (error, result) {
    if (error) {
      res.status(500).send(err);
    } else {
      console.log(result);
      Vehicle.findOneAndUpdate(
        {
          _id: req.body.vehicleId,
          "driverInfo.driverId": req.body.driverId,
        },
        {
          $set: {
            "driverInfo.$.isEnableDriver": true,
          },
        }
      ).exec(function (err, result) {
        console.log(result);
        if (err) {
          res.status(500).send(err);
        } else {
          if (result == null) {
            res.status(304).json({
              message: "no vehicle",
            });
          } else {
            res.status(200).json({
              message: "success",
              content: result,
            });
          }
        }
      });
    }
  });
};

exports.checkInfo2 = function (req, res) {
  if (req.body.vehicleId == null) {
    // Driver.findOne({
    //     _id: req.body.driverId,
    //     isApproved: true
    //   }, {
    //     otpPin: 0,
    //     otpTime: 0,
    //     saltSecret: 0
    //   })
    Driver.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.body.driverId),
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
          "wallet.transactionHistory": 0,
        },
      },
    ])
      // console.log(req.body.driverId)
      // Driver.aggregate([
      //   { $match: { $and: [ { _id: req.body.driverId }, { isApproved: true} ] } },
      //   ])
      .exec(function (err, driver) {
        if (err) {
          res.status(500).send(err);
        } else {
          if (driver != null) {
            console.log(driver);
            res.status(206).json({
              message: "Driver details",
              content1: driver,
              content2: null,
              subCatData: null,
            });
          } else {
            res.status(202).json({
              message: "Driver is not approved",
            });
          }
        }
      });
  } else {
    Driver.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.body.driverId),
          isApproved: true,
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
          "wallet.transactionHistory": 0,
        },
      },
    ]).exec(function (err, driver) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (driver != null) {
          Vehicle.findOne({
            _id: req.body.vehicleId,
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
                console.log(vehicle.vehicleCategory);
                VehicleCategory.find({
                  isEnable: true,
                  categoryName: vehicle.vehicleCategory,
                }).exec(function (err, category) {
                  console.log("hit");
                  if (category == null || category.length == 0) {
                    console.log("failed####");
                    res.status(400).json({
                      message: "failed",
                      details: "No data found",
                      status: "failed",
                    });
                  } else {
                    var subCatData = category[0].subCategory.find(
                      (el) => (el.subCategoryName = vehicle.vehicleSubCategory)
                    );
                    console.log(subCatData);
                    subCatData.roadPickupPriceSelection = [];
                    subCatData.priceSelection = [];
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

exports.checkInfo = function (req, res) {
  console.log("########## driver: checkInfo ##########");
  console.log(req.body.vehicleId);
  console.log(req.body.driverId);

  if (req.body.vehicleId == null) {
    // Driver.findOne({
    //     _id: req.body.driverId,
    //     isApproved: true
    //   }, {
    //     otpPin: 0,
    //     otpTime: 0,
    //     saltSecret: 0
    //   })
    Driver.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.body.driverId),
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
          "wallet.transactionHistory": 0,
        },
      },
    ])
      // console.log(req.body.driverId)
      // Driver.aggregate([
      //   { $match: { $and: [ { _id: req.body.driverId }, { isApproved: true} ] } },
      //   ])
      .exec(function (err, driver) {
        if (err) {
          res.status(500).send(err);
        } else {
          if (driver != null) {
            console.log(driver);
            res.status(206).json({
              message: "Driver details",
              content1: driver,
              content2: null,
              subCatData: null,
            });
          } else {
            res.status(202).json({
              message: "Driver is not approved",
            });
          }
        }
      });
  } else {
    Driver.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.body.driverId),
          isApproved: true,
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
          "wallet.transactionHistory": 0,
        },
      },
    ]).exec(function (err, driver) {
      if (err) {
        res.status(500).send(err);
      } else {
        if (driver != null) {
          Vehicle.findOne({
            _id: req.body.vehicleId,
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
                console.log(vehicle.vehicleCategory);
                VehicleCategory.find({
                  isEnable: true,
                  categoryName: vehicle.vehicleCategory,
                  // "subCategory.subCategoryName": vehicle.vehicleSubCategory
                }).exec(function (err, category) {
                  console.log("hit");
                  if (category == null || category.length == 0) {
                    console.log("failed####");
                    res.status(400).json({
                      message: "failed",
                      details: "No data found",
                      status: "failed",
                    });
                  } else {
                    var subCatData1 = category[0].subCategory.filter(
                      (el) => el.subCategoryName === vehicle.vehicleSubCategory
                    );
                    console.log(subCatData);
                    subCatData1[0].roadPickupPriceSelection = null;
                    subCatData1[0].priceSelection = null;
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

//driver logout
exports.driverLogOut = function (req, res) {
  if (req.body.vehicleId == null) {
    res.status(202).json({
      message: "can logout",
    });
  } else {
    Vehicle.findOneAndUpdate(
      {
        _id: req.body.vehicleId,
        "driverInfo.driverId": req.body.driverId,
      },
      {
        $set: {
          "driverInfo.$.isEnableDriver": false,
        },
      }
    ).exec(function (error, result) {
      if (err) {
        res.status(500).send(error);
      } else {
        res.status(200).json({
          message: "can logout",
        });
      }
    });
  }
};

// authorise driver //
exports.driverLoginRequired = function (req, res, next) {
  console.log("###### login required ######");
  //res.json({status: 'login required'});
  if (req.user) {
    next();
  } else {
    return res.status(401).json({
      message: "Unauthorized driver!",
    });
  }
};

exports.getDispatches = function (req, res) {
  // var fromDate = new Date(req.params.from);
  // var toDate = new Date(req.params.to);

  Dispatch.aggregate([
    {
      $match: {
        $and: [
          {
            dispatcherId: mongoose.Types.ObjectId(req.params.id),
          },
          //   {
          //   $or: [{
          //     status: 'canceled'
          //   }, {
          //     status: 'default'
          //   }, {
          //     status: 'accepted'
          //   }]
          // },
          // {
          //   recordedTime: {
          //     $gte: fromDate,
          //     $lt: toDate
          //   }
          // }
        ],
      },
    },
  ]).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      DispatcherWallet.aggregate(
        {
          $match: {
            dispatcherId: mongoose.Types.ObjectId(req.params.id),
          },
        },
        {
          $unwind: "$transactionHistory",
        }
        // {
        //   $match: {
        //     $and: [
        //       {
        //         'transactionHistory.dateTime': {
        //           $gte: fromDate,
        //           $lt: toDate
        //         }
        //       }
        //     ],
        //   },
        // }
      ).exec(function (err, result1) {
        if (err) {
          res.status(500).send(err);
        } else {
          var totalDispatchEarningsCal = 0;
          var tripsDone = 0;

          result1.forEach((el) => {
            if (el.transactionHistory.trip != null) {
              totalDispatchEarningsCal =
                totalDispatchEarningsCal +
                el.transactionHistory.trip.tripEarning;
              tripsDone = tripsDone + 1;
            }
          });

          res.status(200).json({
            dispatchHistory: result.reverse(),
            walletHistory: result1,
            totalDispatchesDone: tripsDone,
            totalDispatchEarnings: totalDispatchEarningsCal,
          });
        }
      });
    }
  });
};

exports.getTrips = function (req, res) {
  // var fromDate = new Date(req.params.from);
  // var toDate = new Date(req.params.to);

  DriverWallet.aggregate([{
        $match: {
          driverId: mongoose.Types.ObjectId(req.params.id),
        },
      },
        {
          $unwind: "$transactionHistory",
        }]
      // {
      //   $match: {
      //     $and: [
    //       {
    //         'transactionHistory.dateTime': {
    //           $gte: fromDate,
    //           $lt: toDate
    //         }
    //       }
    //     ],
    //   },
    // }
  ).exec(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      // res.status(200).json({
      //   driverWallet: result
      // })

      var totalEarningsCal = 0;
      var tripsDone = 0;

      result.forEach((el) => {
        if (el.transactionHistory.trip != null) {
          totalEarningsCal =
            totalEarningsCal + el.transactionHistory.trip.tripEarning;
          tripsDone = tripsDone + 1;
        }
      });

      res.status(200).json({
        driverWallet: result.reverse(),
        totalTripsDone: tripsDone,
        totalEarnings: totalEarningsCal,
      });
    }
  });
};

exports.getTripStatData = function (req, res) {
  // var fromDate = new Date(req.params.from);
  // var toDate = new Date(req.params.to);
  try {
    DriverWallet.aggregate(
      {
        $match: {
          driverId: mongoose.Types.ObjectId(req.params.id),
        },
      }
      // {
      //   "$unwind": "$transactionHistory"
      // },
      // {
      //   $match: {
      //     $and: [
      //       {
      //         'transactionHistory.dateTime': {
      //           $gte: fromDate,
      //           $lt: toDate
      //         }
      //       }
      //     ],
      //   },
      // }
    ).exec(function (err, result) {
      if (err) {
        res.status(500).send(err);
      } else {
        // res.status(200).json({
        //   driverWallet: result
        // })

        // var totalEarningsCal = 0
        // var tripsDone = 0;

        // result.forEach(el => {
        //   if (el.transactionHistory.trip != null) {
        //     totalEarningsCal = totalEarningsCal + el.transactionHistory.trip.tripEarning;
        //     tripsDone = tripsDone + 1;
        //   }
        // });

        result[0].transactionHistory = [];

        res.status(200).json({
          // driverWallet: result,
          otherTransactions: [],
          content: result[0],
          test: true,
        });
      }
    });
  } catch (error) {
    res.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
};

exports.changeCode = function (req, res) {
  var newValues = {
    $set: {
      driverCode: req.body.code,
    },
  };

  Driver.findByIdAndUpdate(
    req.body.driverId,
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

/* author : ghost */
/* ### Add ratings after trip end ### */
exports.addPassengerRatings = function (req, res) {
  User.findOne({
    contactNumber: req.body.ContactNumber,
  }).exec(function (err, user) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (user == null) {
        console.log(
          "####################### Cannot find user ##########################"
        );
        res.status(400).send({
          message: "failed",
          details: "User not found",
          status: "rate add failed",
        });
      } else {
        console.log(req.body);

        User.update(
          {
            contactNumber: req.body.ContactNumber,
          },
          {
            $push: {
              ratings: {
                rate: req.body.rate,
                feedback: req.body.feedback,
              },
            },
          }
        ).exec(function (err, data) {
          if (err) {
            console.log(err);
            res.status(500).json({
              message: "failed",
              details: "Ratings add failed",
            });
          } else {
            res.status(200).json({
              message: "success",
              details: "Ratings added successfully",
            });
          }
        });
      }
    }
  });
};

exports.deleteDriverByContactNumber = function (req, res) {
  console.log("###### vehicle Category Delete ######");

  Driver.findOne({ mobile: req.body.mobile }).exec(function (err, data) {
    if (err) {
      console.log("error occured");
    } else {
      if (data !== null) {
        Driver.remove({ mobile: req.body.mobile }, function (err) {
          if (err) throw err;
          res.json({
            message: "success",
            details: "Successfully deleted driver",
            content: "deleted driver mobile " + req.body.mobile,
          });
        });
      } else {
        res.json({
          message: "failed",
          details: "This driver not exists",
          content: "This driver not exists",
        });
      }
    }
  });
};

/* author : ghost */
exports.updatePushToken = function (req, res) {
  console.log("########### update user push token ############");
  Driver.findOne({
    mobile: req.body.mobile,
  }).exec(function (err, driver) {
    if (err) {
      res.status(500).json({
        message: "Server Error",
      });
    } else {
      if (driver == null) {
        console.log(
          "####################### Cannot find driver ##########################"
        );
        res.status(400).send({
          message: "failed",
          details: "Driver not found",
          status: "Driver push token update failed",
        });
      } else {
        if (req.body.token != null) {
          Driver.update(
            {
              mobile: req.body.mobile,
            },
            {
              $set: {
                pushToken: req.body.token,
              },
            }
          ).exec(function (err, data) {
            if (err) {
              console.log(err);
              res.status(500).json({
                message: "failed",
                details: "Server Error!",
              });
            } else {
              res.status(200).json({
                message: "success",
                details: "Driver push token updated successfully",
              });
            }
          });
        } else {
          res.status(500).json({
            message: "failed",
            details: "Driver push token update failed!",
          });
        }
      }
    }
  });
};

exports.getTripStatDataEd = async function (req, res) {
  try {
    delete mongoose.models.DriverWallet;
    delete mongoose.modelSchemas.DriverWallet;
    const data = await DriverWallet.aggregate({
      $match: { driverId: mongoose.Types.ObjectId(req.params.id) },
    });

    const dataTr = data[0].transactionHistory;

    if (data) {
      var result = [];
      dataTr.reduce(function (res, value) {
        if (!res[value.method]) {
          res[value.method] = { method: value.method, transactionAmount: 0 };
          result.push(res[value.method]);
        }
        res[value.method].transactionAmount += value.transactionAmount;
        return res;
      }, {});

      res.status(200).json({ result, data });
    } else {
      res.status(404).send({ message: "data not found" });
    }
  } catch (error) {
    //res.send("error");
    res.status(500).send({ message: "Something went wrong" });
  }

  // // var fromDate = new Date(req.params.from);
  // // var toDate = new Date(req.params.to);

  // DriverWallet.aggregate(
  //   {
  //     $match: {
  //       driverId: mongoose.Types.ObjectId(req.params.id),
  //     },
  //   }
  //   // {
  //   //   "$unwind": "$transactionHistory"
  //   // },
  //   // {
  //   //   $match: {
  //   //     $and: [
  //   //       {
  //   //         'transactionHistory.dateTime': {
  //   //           $gte: fromDate,
  //   //           $lt: toDate
  //   //         }
  //   //       }
  //   //     ],
  //   //   },
  //   // }
  // ).exec(function (err, result) {
  //   if (err) {
  //     res.status(500).send(err);
  //   } else {
  //     // res.status(200).json({
  //     //   driverWallet: result
  //     // })

  //     // var totalEarningsCal = 0
  //     // var tripsDone = 0;

  //     // result.forEach(el => {
  //     //   if (el.transactionHistory.trip != null) {
  //     //     totalEarningsCal = totalEarningsCal + el.transactionHistory.trip.tripEarning;
  //     //     tripsDone = tripsDone + 1;
  //     //   }
  //     // });

  //     result[0].transactionHistory = [];

  //     res.status(200).json({
  //       // driverWallet: result,
  //       otherTransactions: [],
  //       content: result[0],
  //     });
  //   }
  // });
};
