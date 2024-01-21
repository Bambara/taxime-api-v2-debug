"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
// const Driver = require("../models/driver");
const DriverWallet = require("../models/driverwallet");
const DispatcherWallet = require("../models/dispatcherwallet");
const CompanyWallet = require("../models/companywallet");
const PassengerWallet = require("../models/passengerwallet");

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

exports.DriverWalletUpdateAfterTripEnd = function (
  driverId,
  driverTransactionObj,
  adminCost,
  driverCost
) {
  DriverWallet.update(
    {
      driverId: driverId,
    },
    {
      $push: {
        transactionHistory: driverTransactionObj,
      },
      $inc: {
        totalWalletPoints: -1 * adminCost,
        driverEarnings: driverCost,
        adminEarnings: adminCost,
      },
    },
    function (error, driverWallet) {
      if (error) {
        console.log("Driver Wallet Update After TripEnd error: " + error);
      }
      console.log("Driver Wallet Updated After TripEnd");
    }
  );
};

exports.DriverWalletUpdateFromReferral = function (
  driverId,
  driverTransactionObj,
  driverCost
) {
  console.log(driverTransactionObj);
  DriverWallet.update(
    {
      driverId: driverId,
    },
    {
      $push: {
        transactionHistory: driverTransactionObj,
      },
      $inc: {
        driverEarnings: driverCost,
      },
    },
    function (error, driverWallet) {
      if (error) console.log(error);
      console.log("driver wallet update");
    }
  );
};

exports.DriverWalletUpdateAfterDispatchpEnd = function (
  driverId,
  driverTransactionObj,
  dipatch_admin_cost,
  driverCost
) {
  console.log(driverTransactionObj);
  DriverWallet.update(
    {
      driverId: driverId,
    },
    {
      $push: {
        transactionHistory: driverTransactionObj,
      },
      $inc: {
        totalWalletPoints: -1 * dipatch_admin_cost,
        driverEarnings: driverCost,
        adminEarnings: dipatch_admin_cost,
      },
    },
    function (error, driverWallet) {
      if (error) console.log(error);
      console.log("driver wallet update");
    }
  );
};

exports.DispatcherWalletUpdateAfterTripEnd = function (
  dispatcherId,
  dispatcherType,
  dispatcherTransactionObj,
  dispatcherCost
) {
  DispatcherWallet.update(
    {
      $and: [
        { dispatcherId: mongoose.Types.ObjectId(dispatcherId) },
        { dispatcherType: dispatcherType },
      ],
    },
    {
      $push: {
        transactionHistory: dispatcherTransactionObj,
      },
      $inc: {
        totalWalletPoints: dispatcherCost,
        dispatcherEarnings: dispatcherCost,
        //adminEarnings: adminCost
      },
    },
    function (error2, dispatcherWallet) {
      if (error2) console.log(error2);

      console.log(dispatcherWallet);
      console.log("dispatcher wallet update");
    }
  );
};

exports.DispatcherWalletUpdateFromReferral = function (
  dispatcherId,
  dispatcherType,
  dispatcherTransactionObj,
  dispatcherCost
) {
  DispatcherWallet.update(
    {
      $and: [
        { dispatcherId: mongoose.Types.ObjectId(dispatcherId) },
        { dispatcherType: dispatcherType },
      ],
    },
    {
      $push: {
        transactionHistory: dispatcherTransactionObj,
      },
      $inc: {
        totalWalletPoints: dispatcherCost,
        dispatcherEarnings: dispatcherCost,
        //adminEarnings: adminCost
      },
    }
  ).exec(function (error2, dispatcherWallet) {
    if (error2) console.log(error2);

    console.log(dispatcherWallet);
    console.log("dispatcher wallet update");
  });
};

// exports.CompanyWalletUpdateAfterTripEnd = function(companyTransactionObj, adminCost) {

//     CompanyWallet.update({
//         companyName: 'TaxiMeCompany'
//       }, {
//         $push: {
//           transactionHistory: companyTransactionObj
//         },
//         $inc: {
//           //totalWalletPoints : -1 * (dispatcherCost+adminCost),
//           //dispatcherEarnings: dispatcherCost
//           adminEarnings: adminCost
//         }
//       }, function (errror3, companywallet) {
//         console.log('company wallet update error: '+ errror3)
//         console.log('company wallet update')
//       });
// }

/* author : ghost  */
exports.CompanyWalletUpdateAfterTripEnd = function (
  companyTransactionObj,
  adminCost
) {
  CompanyWallet.update(
    {
      companyCode: "TAXIME",
    },
    {
      $push: { transactionHistory: companyTransactionObj },
      $inc: {
        //totalWalletPoints : -1 * (dispatcherCost+adminCost),
        //dispatcherEarnings: dispatcherCost
        adminEarnings: adminCost,
      },
    },
    function (errror3, companywallet) {
      if (errror3) {
        console.log("Company Wallet Update After Trip End error: " + errror3);
      }
      console.log("Company Wallet Updated After Trip End");
    }
  );
};

exports.PassengerWalletUpdateAfterTripEnd = function (
  passengerId,
  passengerTransactionObj,
  passengerCost
) {
  PassengerWallet.updateOne(
    {
      passengerId: passengerId,
    },
    {
      $push: {
        transactionHistory: passengerTransactionObj,
      },
      $inc: {
        totalWalletPoints: passengerCost,
      },
    },
    function (error, passengerWallet) {
      console.log("passenger wallet update");
    }
  );
};

exports.DriverWalletUpdateForTripCancel = function (
  driverId,
  driverTransactionObj,
  cancelCost
) {
  DriverWallet.update(
    {
      driverId: driverId,
    },
    {
      $push: {
        transactionHistory: driverTransactionObj,
      },
      $inc: {
        totalWalletPoints: -1 * cancelCost,
        driverEarnings: -1 * cancelCost,
        adminEarnings: cancelCost,
      },
    },
    function (error, driverWallet) {
      console.log("driver wallet update");
    }
  );
};

exports.CompanyWalletUpdateForTripCancel = function (
  companyTransactionObj,
  cancelCost
) {
  CompanyWallet.update(
    {
      companyName: "TaxiMeCompany",
    },
    {
      $push: {
        transactionHistory: companyTransactionObj,
      },
      $inc: {
        //totalWalletPoints : -1 * (dispatcherCost+adminCost),
        //dispatcherEarnings: dispatcherCost
        adminEarnings: cancelCost,
      },
    },
    function (errror3, companywallet) {
      console.log("company wallet update error: " + errror3);
      console.log("company wallet update");
    }
  );
};

exports.updateDriverWallet = function (driverId, amount) {
  return new Promise((resolve) => {
    var newVals = {
      $inc: {
        totalWalletPoints: amount,
      },
    };
    resolve(true);
    // Driverwallet.findOneAndUpdate({driverId: driverId}, newVals, function (err, wallet) {
    //     if (err) {
    //         console.log(err);
    //         resolve(false);
    //     } else {
    //         resolve(true);
    //     }
    // });
  });
};
