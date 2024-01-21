"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
const cors = require("cors");
const CorporateUser = require("../models/corporateuser");
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const cryptoHandler = "../controllers/cryptoHandler";
//const User = mongoose.model('User');
// const sendSms = require("../services/sendSms");
// const otp = require("../services/randomnum");
const imageUpload = require("./imageUpload");

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
  console.log("###### corporeate user ######");
  res.json({ status: "corporeate user" });
};

/* ### Signup / Register ### */
exports.corporateUserAddByAdmin = function (req, res) {
  console.log("###### corporate user register ######");
  CorporateUser.findOne({ companyEmail: req.body.email }).exec(function (
    err,
    data
  ) {
    if (err) {
      console.log("####### error occured" + err);
      res.status(400).send("error");
    } else {
      if (data !== null) {
        console.log(
          "####################### not an null data : corporate user already exist ##########################"
        );
        res.status(400).send({
          message: "failed",
          details: "Corporate user already exist!",
          status: "signup_failed",
        });
      } else {
        console.log("######");
        var corporateUser = new CorporateUser();
        corporateUser.companyName = req.body.companyName;
        corporateUser.firstName = req.body.firstName;
        corporateUser.lastName = req.body.lastName;
        corporateUser.contactNumber = req.body.mobile;
        corporateUser.companyEmail = req.body.email;
        corporateUser.address.address = req.body.address;
        corporateUser.address.zipcode = req.body.zipcode;
        corporateUser.address.city = req.body.city;
        corporateUser.address.state = req.body.state;
        corporateUser.address.country = req.body.country;
        corporateUser.employeeStrength = req.body.employeeStrength;
        corporateUser.password = bcrypt.hashSync(req.body.password, 10);
        corporateUser.isApproved = req.body.isApproved;
        corporateUser.isEnable = req.body.isEnable;
        let salt = bcrypt.hashSync(req.body.email, 5);
        corporateUser.saltSecret = salt.replace(/[^a-zA-Z ]/g, "");

        corporateUser.save(async function (err, data) {
          if (err) {
            console.log(
              "#################### error occured #######################"
            );
            console.log(err);
            res.send(err);
          } else {
            console.error(data);
            imageUpload.uploadImages(
              req.files,
              data._id,
              CorporateUser,
              "CorporateUser"
            );

            res.status(200).json({
              message: "success",
              details: "Added Corporate User successfully",
            });
          }
        });
      }
    }
  });
};

exports.getCorporateUsers = function (req, res) {
  console.log("###### get corporate user ######");
  CorporateUser.find().exec(function (err, data) {
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
        res.json({
          message: "success",
          details: "get data Successfully",
          content: data,
        });
      }
    }
  });
};
