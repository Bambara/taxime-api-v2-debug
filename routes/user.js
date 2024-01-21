"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
// var mongoose = require('mongoose');
const cors = require("cors");
// var User = require('../models/user');
const UserController = require("../controllers/user");
const AdminController = require("../controllers/admin");
// var PaymentService = require('../services/payment');
app.use(cors());
router.use(cors());

/* auther : ghost */
var UserFirewall = require("../firewallPolicy/userFirewall");
const DriverController = require("../controllers/driver");

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

// router.get('/', UserController.loginRequired, UserController.user);
router.post("/registerOTP", UserController.registerOTP);
router.post("/validateOTP", UserController.validateOTP);
router.post("/signup", UserController.register);
router.post(
    "/deleteUserByContactNumber",
    UserController.deleteUserByContactNumber
);

router.get("/getDispatches/:id", UserController.getDispatches);

router.post("/resendOTP", UserController.getOtp);

router.post("/login", UserController.signIn);
router.post("/validateLoginOTP", UserController.validateLoginOTP);

router.post(
    "/getPassengerProfile",
    UserController.getPassangerProfileByContactNumber
);

// router.post('/addFavouriteLocation', UserController.userLoginRequired, UserController.addFavouriteLocation);
// router.post('/removeFavouriteLocation', UserController.userLoginRequired, UserController.removeFavouriteLocation);
// router.get('/getFavouriteLocation/:ContactNumber', UserController.userLoginRequired, UserController.getFavouriteLocation);

router.post("/addFavouriteLocation", UserController.addFavouriteLocation);
router.post("/removeFavouriteLocation", UserController.removeFavouriteLocation);
router.get(
    "/getFavouriteLocation/:ContactNumber",
    UserController.getFavouriteLocation
);

/* get user all info */
router.post(
    "/checkInfo",
    /*UserController.userLoginRequired,*/ UserController.checkInfo
);

router.post(
    "/addDispatcherReferalCode",
    /*UserController.userLoginRequired,*/ UserController.addDispatcherReferalCode
);

//router.get('/getTrips/:id/:from/:to', UserController.userLoginRequired, UserController.getTrips);

/* get trips by user id */
router.get("/getTrips/:id", UserController.getTrips);

router.get(
    "/getLatestUserAndroidVersion",
    UserController.getLatestAndroidUserVersion
);
router.get("/getLatestIosUserVersion", UserController.getLatestIosUserVersion);
router.post(
    "/updatepassenger",
    AdminController.adminloginRequired,
    UserController.editPassenger
);

// router.put(
//     '/update',
//     UserController.updateProfile
// );

/* update user profile */
router.put("/update", UserController.updateUserProfile);

// router.put('/updatePassword', UserController.loginRequired, UserController.updatePassword);
// router.post('/checkEmail', UserController.checkEmail);
// router.post('socialLogin', UserController.SocialMediaLoginRegister);
//router.post('/loginreq', UserController.loginRequired); //Auth-Token-Test

// router.post('/forgotPassword');
// router.post('/changePassword');

/* update user profile image */
router.post("/update_profile_image", UserController.updateProfileImage);

/* update user push token */
router.post("/update_push_token", UserController.updatePushToken);

/* add driver ratings */
router.post("/add_driver_ratings", UserController.addDriverRatings);

/* update user payemnt method */
router.post("/update_pay_method", UserController.updatePayMethod);

//router.get('/getFavouriteLocation/:ContactNumber', UserController.getFavouriteLocation);

/* ghost testing route */
router.post("/testfun", UserController.testFun);

module.exports = router;
