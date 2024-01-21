"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var AdminController = require("../controllers/admin");
var DispatcherController = require("../controllers/dispatcher");

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

router.get("/", DispatcherController.dispatcher);

router.post(
  "/getDispatcherDataById",
  DispatcherController.getDispatcherDataById
);

router.get(
  "/getdispatchers",
  AdminController.adminloginRequired,
  DispatcherController.getDispatchers
);
router.post(
  "/getDispatcherspagination",
  DispatcherController.getDispatcherspagination
);
router.post(
  "/createdispatcher",
  AdminController.adminloginRequired,
  DispatcherController.createDispatcher
);
router.post(
  "/create_user_dispatcher",
  DispatcherController.createUserDispatcher
);
router.post(
  "/changestatus",
  AdminController.adminloginRequired,
  DispatcherController.changeDispatcherStatus
);
router.post(
  "/update",
  AdminController.adminloginRequired,
  DispatcherController.updateDispatcher
);

router.post(
  "/changeCode",
  AdminController.adminloginRequired,
  DispatcherController.changeCode
);

module.exports = router;
