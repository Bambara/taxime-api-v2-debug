"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cors = require("cors");
var User = require("../models/user");
var Driver = require("../models/driver");
var sendSms = require("../services/sendSms");
var sendPassengerPushNotification = require("../services/passengerPushNotifications");
var PromotionModal = require("../models/promotion");
var AgentWalletModal = require("../models/agentwallet");
var Setting = require("../models/setting");
var config = require("../config");

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
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

exports.addPromotion = function (req, res) {
  console.log("###### promotion : addPromotion ######");
  console.log(req.body);

  var promo = new PromotionModal();

  promo.name = req.body.name;
  promo.promoFor = req.body.promoFor;
  promo.promocode = req.body.promocode;
  promo.commission = req.body.commission;

  promo.save(function (err) {
    if (err) {
      console.log("#################### error occured #######################");
      console.log(err);
      res.send(err);
    } else {
      res.status(200).json({
        message: "success",
        details: "Promotion added successful",
      });
    }
  });
};

exports.getAllPromotions = function (req, res) {
  console.log("###### promotion : getAllPromotions ######");

  PromotionModal.find({})
    .sort({ recordedTime: -1 })
    .exec(function (err, promotions) {
      if (err) {
        console.log("####### error occured" + err);
        res.status(400).send("error");
      } else {
        if (promotions == null) {
          res.status(400).json({
            message: "failed",
            details: "No data found",
            status: "failed",
          });
        } else {
          res.json({
            message: "success",
            details: "get promotions data Successfully",
            content: promotions,
          });
        }
      }
    });
};

exports.getAllPromotionsByType = function (req, res) {
  console.log("###### promotion : getAllPromotions ######");

  PromotionModal.find({
    promoFor: req.params.type,
    isEnable: true,
  })
    .sort({ recordedTime: -1 })
    .exec(function (err, promotions) {
      if (err) {
        console.log("####### error occured" + err);
        res.status(400).send("error");
      } else {
        if (promotions == null) {
          res.status(400).json({
            message: "failed",
            details: "No data found",
            status: "failed",
          });
        } else {
          res.json({
            message: "success",
            details: "get promotions data Successfully",
            content: promotions,
          });
        }
      }
    });
};

/* update admin */
exports.updatePromoCommissionById = function (req, res) {
  console.log("###### promotion : updatePromoCommissionById ######");
  console.log(req.body);

  let newValues;

  newValues = {
    $set: {
      commission: req.body.commission,
    },
  };

  PromotionModal.findByIdAndUpdate(
    req.body.promoId,
    newValues,
    function (err, results) {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: err,
        });
      } else {
        if (results != null) {
          res.status(200).json({
            message: "successfully updated",
          });
        } else {
          res.status(500).json({
            message: "update failed",
          });
        }
      }
    }
  );
};

/* check ang get promotions */
exports.checkPrmotions = function (type) {
  return new Promise((resolve, reject) => {
    PromotionModal.aggregate({
      $match: {
        promoFor: type,
        isEnable: true,
      },
    })
      .sort({ recordedTime: -1 })
      .exec(function (err, promotions) {
        if (err) {
          console.log("####### error occured" + err);
          resolve(false);
        } else {
          if (promotions == null) {
            resolve(false);
          } else {
            resolve(promotions);
          }
        }
      });
  });
};

/* check ang get promotions */
exports.checkPromotions = function (type, code) {
  return new Promise((resolve, reject) => {
    PromotionModal.aggregate({
      $match: {
        promoFor: type,
        promocode: code,
        isEnable: true,
      },
    })
      .sort({ recordedTime: -1 })
      .exec(function (err, promotions) {
        if (err) {
          console.log("####### error occured" + err);
          resolve(false);
        } else {
          if (promotions == null) {
            resolve(false);
          } else {
            resolve(promotions);
          }
        }
      });
  });
}; /* check agent promo code */

exports.checkAgentPromoCodes = function (type) {
  return new Promise((resolve, reject) => {
    PromotionModal.aggregate({
      $match: {
        promoFor: type,
        isEnable: true,
      },
    })
      .sort({ recordedTime: -1 })
      .exec(function (err, promotions) {
        if (err) {
          console.log("####### error occured" + err);
          resolve(false);
        } else {
          if (promotions == null) {
            resolve(false);
          } else {
            resolve(promotions);
          }
        }
      });
  });
};
