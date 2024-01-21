"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var DriverController = require("../controllers/driver");
var AdminController = require("../controllers/admin");
var auth = require("../services/authorize");

var DriverFirewall = require("../firewallPolicy/driverFirewall");

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

// router.post(
//     '/driverregister',
//     DriverFirewall.checkDriverRegister,
//     DriverController.registerDriver
// );
router.post("/driverregister", DriverController.registerDriver);
router.post("/driverlogin", DriverController.otpLogin);
router.post("/getotp", DriverController.getOtp);
router.get("/confirmemail/:salt", DriverController.confirmEmail);
router.post("/sendotp", DriverController.sendOtp);
router.post(
  "/deleteDriverByContactNumber",
  DriverController.deleteDriverByContactNumber
);

router.post("/addvehicle", DriverController.driverAddVehicle);
router.post("/getvehicledetails", DriverController.getVehicleDetails);
router.post("/selectvehicle", DriverController.driverSelectVehicle);

/* get driver all info by driver id*/
router.post("/checkinformation", DriverController.checkInfo);
router.post("/checkinformation2", DriverController.checkInfo2);

// #####Admin control routes########

router.post(
  "/deleteDriver",
  AdminController.adminloginRequired,
  DriverController.deleteDriver
);

router.get(
  "/getapproveddrivers",
  AdminController.adminloginRequired,
  DriverController.getApprovedDrivers
);
router.post(
  "/getapproveddriverspagination",
  DriverController.getapproveddriverspagination
);

/* agent get drivers */
router.post(
  "/getapproveddriverspaginationbycompany",
  DriverController.getapproveddriverspaginationbycompany
);

router.get(
  "/geteligibledrivers",
  AdminController.adminloginRequired,
  DriverController.getEligibleDrivers
);

/* agent get eligible drivers */
router.get(
  "/geteligibledriversbycompany/:companyCode",
  AdminController.adminloginRequired,
  DriverController.geteligibledriversbycompany
);

router.post(
  "/enabledriver",
  auth.authorize(["super"]),
  DriverController.adminEnableDriver
);
router.post(
  "/updatedriver",
  AdminController.adminloginRequired,
  DriverController.updateDriver
);

/* update user profile */
router.post("/update", DriverController.updateDriverProfile);

/* update driver profile image */
router.post("/update_profile_image", DriverController.updateProfileImage);

router.post("/updatedriverimagesbyid", DriverController.updateDriverImagesById);

// get latest app version
router.get(
  "/getLatestAndroidVersion",
  DriverController.getLatestAndroidVersion
);

router.get("/getDispatches/:id", DriverController.getDispatches);
router.get("/getTrips/:id", DriverController.getTrips);
router.get("/getTripStatData/:id", DriverController.getTripStatData);

router.get("/getTripStatDataEd/:id", DriverController.getTripStatDataEd);

router.post("/changeCode", DriverController.changeCode);

/* auther : ghost */
router.post("/add_passenger_ratings", DriverController.addPassengerRatings);

/* update driver push token */
router.post("/update_push_token", DriverController.updatePushToken);

module.exports = router;
