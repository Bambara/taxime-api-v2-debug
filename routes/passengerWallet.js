"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const PassengerWalletController = require("../controllers/passengerWallet");
// const DriverController = require('../controllers/driver');
const AdminController = require("../controllers/admin");

app.use(cors());
router.use(cors());

//support on x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {
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
  PassengerWalletController.createWallet
);
router.post(
  "/rechargewallet",
  AdminController.adminloginRequired,
  PassengerWalletController.rechargeWallet
);
router.post(
    "/updatewallet",
    AdminController.adminloginRequired,
    PassengerWalletController.updateWallet
);
router.post(
    "/getWallet",
    PassengerWalletController.getWallet
);

router.patch(
    "/add_card",
    PassengerWalletController.addCard
);

router.get(
    "/get_card",
    PassengerWalletController.getCard
);

module.exports = router;
