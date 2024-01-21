"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var DispatcherWalletController = require("../controllers/dispatcherWallet");
var DriverController = require("../controllers/driver");
var AdminController = require("../controllers/admin");

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

router.post(
  "/createwallet",
  AdminController.adminloginRequired,
  DispatcherWalletController.createWallet
);
router.post(
  "/rechargewallet",
  AdminController.adminloginRequired,
  DispatcherWalletController.rechargeWallet
);
router.post(
  "/updatewallet",
  AdminController.adminloginRequired,
  DispatcherWalletController.updateWallet
);
router.post(
  "/getWallet",
  AdminController.adminloginRequired,
  DispatcherWalletController.getWallet
);

module.exports = router;
