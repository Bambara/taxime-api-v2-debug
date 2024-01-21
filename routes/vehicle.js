"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var AdminController = require("../controllers/admin");
var VehicleController = require("../controllers/vehicle");

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
  "/addvehicle",
  AdminController.adminloginRequired,
  VehicleController.addVehicle
);
router.post(
  "/enablevehicle",
  AdminController.adminloginRequired,
  VehicleController.adminEnableVehicle
);
router.get(
  "/getvehiclestoapprove",
  AdminController.adminloginRequired,
  VehicleController.getVehiclesToApprove
);
router.get(
  "/getapprovedvehicles",
  AdminController.adminloginRequired,
  VehicleController.getApprovedVehicles
);
router.post(
  "/getapprovedvehiclespagination",
  VehicleController.getapprovedvehiclespagination
);

/* get agent vehicles to approve */
router.get(
  "/getvehiclestoapprovebycompany/:companyCode",
  AdminController.adminloginRequired,
  VehicleController.getvehiclestoapprovebycompany
);
/* get agent vehicles */
router.post(
  "/getapprovedvehiclespaginationbycompany",
  VehicleController.getapprovedvehiclespaginationbycompany
);

router.post(
  "/approvevehicle",
  AdminController.adminloginRequired,
  VehicleController.approveVehicle
);
router.post(
  "/updatevehicle",
  AdminController.adminloginRequired,
  VehicleController.updateVehicle
);
router.post(
  "/adddrivers",
  AdminController.adminloginRequired,
  VehicleController.addDriverToVehicle
);
router.post(
  "/deletedrivers",
  AdminController.adminloginRequired,
  VehicleController.deleteDrivers
);
router.post(
  "/changevehicledriver",
  AdminController.adminloginRequired,
  VehicleController.changeVehicleDriverState
);
router.post(
  "/managedrivers",
  AdminController.adminloginRequired,
  VehicleController.manageDrivers
);
router.post(
  "/updatevehicleimagesbyid",
  VehicleController.updateVehicleImagesById
);
router.post("/removevehicle", VehicleController.deleteVehicle);

module.exports = router;
