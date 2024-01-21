"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var VehicleCategory = require("../models/vehiclecategory");
var VehicleCategoryController = require("../controllers/vehiclecategory");
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

//#################### Category ############################
router.post(
  "/savecategoryalldata",
  VehicleCategoryController.saveCategoryAllData
);
router.get("/getCategoryAllData", VehicleCategoryController.getCategoryAllData);
router.get(
  "/getEnabledCategoryAllData",
  VehicleCategoryController.getEnabledCategoryAllData
);

router.post(
  "/getCategoryAllDataTimeAndLocationBased",
  VehicleCategoryController.getCategoryAllDataTimeAndLocationBased
);

router.post(
  "/updateCategoryData",
  VehicleCategoryController.updateCategoryData
);
router.post(
  "/deleteCategoryAllData",
  VehicleCategoryController.deleteCategoryAllData
);

//#################### upload images ############################
router.post(
  "/categoryImageUpload",
  VehicleCategoryController.categoryImageUpload
);

//#################### Sub Category ############################
router.post("/addSubCategory", VehicleCategoryController.addSubCategory);
router.post("/deleteSubCategory", VehicleCategoryController.deleteSubCategory);
router.post("/updateSubCategory", VehicleCategoryController.updateSubCategory);

//#################### Vehicle ############################
router.post("/addVehicle", VehicleCategoryController.addVehicle);
router.post("/deleteVehicle", VehicleCategoryController.deleteVehicle);
router.post("/updateVehicle", VehicleCategoryController.updateVehicle);

//#################### Price Selection ############################
router.post("/addPriceSelection", VehicleCategoryController.addPriceSelection);
router.post(
  "/updatePriceSelection",
  VehicleCategoryController.updatePriceSelection
);
router.post(
  "/deletePriceSelection",
  VehicleCategoryController.deletePriceSelection
);

//#################### Road Pickup price selection ############################
router.post(
  "/addRoadPickupPriceSelection",
  VehicleCategoryController.addRoadPickupPriceSelection
);
router.post(
  "/updateRoadPickupPriceSelection",
  VehicleCategoryController.updateRoadPickupPriceSelection
);
router.post(
  "/deleteRoadPickupPriceSelection",
  VehicleCategoryController.deleteRoadPickupPriceSelection
);

module.exports = router;
