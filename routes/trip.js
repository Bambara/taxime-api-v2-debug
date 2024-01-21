"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const RoadPickupController = require("../controllers/roadPickup");
const AdminController = require("../controllers/admin");
const TripController = require("../controllers/trip");
const TripControllerNew = require("../controllers/tripnew");
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

router.post("/finddriverforpassenger", TripController.findDriverForPassenger);
router.post("/acceptlivetrip", TripController.driverAcceptLiveTrip);
router.post("/endlivetrip", TripController.endLiveTrip);
router.post("/gettripdetailsbyid", TripController.getTripDetailsbyId);
router.post("/cancelbypassenger", TripController.cancelTripByPassenger);
router.post("/cancelbydriver", TripController.cancelTrip);

/* author ghost */
router.post("/findonlinedrivers", TripControllerNew.findDriverForPassenger);

/* cancel trip before accept */
router.post("/cancel_dispatch", TripController.cancelDispatch);

module.exports = router;
