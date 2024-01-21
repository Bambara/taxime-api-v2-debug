"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var AdminController = require("../controllers/admin");
var PromotionController = require("../controllers/promotion");
var auth = require("../services/authorize");

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

router.get("/", AdminController.admin);

router.post("/adminRegister", AdminController.registerAdmin);

router.post("/adminUpdateById", AdminController.adminUpdateById);
router.post("/adminlogin", AdminController.signInAdmin);
router.post(
  "/getAdminDataById",
  AdminController.adminloginRequired,
  AdminController.getAdminDataById
);
router.get(
  "/getAllAdmins",
  AdminController.adminloginRequired,
  AdminController.getAllAdmins
);

router.get(
  "/getdriverstoapprove",
  AdminController.adminloginRequired,
  AdminController.getDriversToApprove
);

/* agent */
router.post(
  "/getdriverstoapprovebycompany",
  AdminController.adminloginRequired,
  AdminController.getdriverstoapprovebycompany
);

router.get(
  "/getdrivers",
  auth.authorize(["super", "operation"]),
  AdminController.getDrivers
);

router.post(
  "/adddriver",
  AdminController.adminloginRequired,
  AdminController.addDriver
);
router.post(
  "/approvedriver",
  AdminController.adminloginRequired,
  AdminController.adminApproveDriver
);

router.post(
  "/adduser",
  AdminController.adminloginRequired,
  AdminController.addUser
);

/* author : ghost */
router.post(
  "/getDriverInfoById",
  AdminController.adminloginRequired,
  AdminController.getDriverInfoById
);

/* get driver all info */
router.post(
  "/getDriverAllInfoById",
  AdminController.adminloginRequired,
  AdminController.getDriverAllInfoById
);

router.get("/getAllUsers", AdminController.getAllUsers);
router.get("/getVehicleTracking", AdminController.getVehicleTracking);
router.post(
  "/getOnlneDriversByRadious",
  AdminController.getOnlneDriversByRadious
);
router.get("/cwallet", AdminController.createCompanyWallet);

router.delete("/cleartrackings", AdminController.clearVehicleTracks);

router.get(
  "/getAllManualCustomers/:text",
  AdminController.getAllManualCustomers
);

router.post("/getAllUserspagination", AdminController.getAllUserspagination);
router.post(
  "/getAllManualCustomerspagination",
  AdminController.getAllManualCustomerspagination
);

router.get("/getDashboardData/:from/:to", AdminController.getDashboardData);

/* agent dashboard */
router.get(
  "/getDashboardDataByCompany/:from/:to/:companyCode",
  AdminController.getDashboardDataByCompany
);

router.get("/getCompanyWallet/:from/:to", AdminController.getCompanyWallet);
router.get(
  "/getCompanyWalletpagination/:from/:to/:param/:text/:pageNo",
  AdminController.getCompanyWalletpagination
);

/* get agent company wallet */
router.post("/getCompanyWalletById", AdminController.getCompanyWalletById);

router.get(
  "/gettripDataByTripId/:id/:transactionType",
  AdminController.gettripDataByTripId
);

router.get(
  "/changeAndroidDriverVersion/:version",
  AdminController.changeAndroidDriverVersion
);
router.get(
  "/changeAndroidPassengerVersion/:version",
  AdminController.changeAndroidPassengerVersion
);
router.get(
  "/changeIosPassengerVersion/:version",
  AdminController.changeIosPassengerVersion
);

/* agent routes */
router.post("/agentRegister", AdminController.registerAgent);
router.get(
  "/getAgents",
  AdminController.adminloginRequired,
  AdminController.getAllAgents
);
router.post(
  "/getAgentDataById",
  AdminController.adminloginRequired,
  AdminController.getAgentDataById
);
router.post(
  "/getAgentTransactionDataById",
  AdminController.adminloginRequired,
  AdminController.getAgentTransactionDataById
);
router.post(
  "/getAgentDriversDataByCode",
  AdminController.adminloginRequired,
  AdminController.getAgentDriversDataByCode
);
router.post(
  "/rechargeAgentWalletById",
  AdminController.adminloginRequired,
  AdminController.rechargeAgentWalletById
);

/* get promotions */
router.get(
  "/getPromotions",
  AdminController.adminloginRequired,
  PromotionController.getAllPromotions
);
router.get(
  "/getPromotionsByType/:type",
  AdminController.adminloginRequired,
  PromotionController.getAllPromotionsByType
);
router.post("/addPromotion", PromotionController.addPromotion);
router.post(
  "/updatePromoCommissionById",
  AdminController.adminloginRequired,
  PromotionController.updatePromoCommissionById
);

module.exports = router;
