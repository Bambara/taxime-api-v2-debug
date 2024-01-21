var express = require("express");
var router = express.Router();
var PaymentController = require("../controllers/payment");

router.post("/topup", PaymentController.topup);

router.post("/refund", PaymentController.refund);

module.exports = router;
