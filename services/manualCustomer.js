"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var ManualCustomer = require("../models/manualcustomer");

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

exports.saveManualCustomer = function (customerObj) {
  ManualCustomer.findOne(
    {
      mobile: customerObj.customerTelephoneNo,
    },
    function (err, data) {
      if (err) {
      } else {
        if (data == null) {
          var manualcustomer = new ManualCustomer();
          manualcustomer.firstName = customerObj.customerName;
          // manualcustomer.lastName = req.body.lastName;
          // manualcustomer.email = req.body.email;
          manualcustomer.mobile = customerObj.customerTelephoneNo;

          manualcustomer.save(async function (err, data) {});
        } else {
          console.log("manual customer not null");
        }
      }
    }
  );
};
