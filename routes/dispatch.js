"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var Dispatch = require("../models/dispatch");
var DispatchController = require("../controllers/dispatch");
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

router.post("/", DispatchController.Dispatch);

/* add new dispatch trip */
router.post("/addDispatch", DispatchController.addDispatch);

/* get enabled vehicle category list */
router.post("/getDispatchPriceLimit", DispatchController.getDispatchPriceLimit);

router.post(
  "/adminadddispatch",
  AdminController.adminloginRequired,
  DispatchController.adminDispatch
);

/* accept dispatch trip */
router.post("/acceptdispatch", DispatchController.driverAcceptDispatch);

/* cancel dispatch trip */
router.post("/canceldispatch", DispatchController.cancelDispatch);

/* finish dispatch trip */
router.post("/enddispatch", DispatchController.endDispatch);

/* calculate estimated cost */
router.post("/getEstimatedCost", DispatchController.getEstimatedCost);

router.get("/getdispatch/:from/:to", DispatchController.getDispatches);
router.get(
  "/getFailedDispatches/:from/:to",
  DispatchController.getFailedDispatches
);

router.get(
  "/getdispatchpagination/:from/:to/:param/:text/:pageNo",
  DispatchController.getdispatchpagination
);
router.get(
  "/getFailedDispatchespagination/:from/:to/:status/:category/:pageNo/:text",
  DispatchController.getFailedDispatchespagination
);

module.exports = router;
