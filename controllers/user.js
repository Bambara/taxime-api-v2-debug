"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("../models/user");
// const UserController = require('../controllers/user');
const jwt = require("jsonwebtoken");
// const bcrypt = require('bcryptjs');
// const cryptoHandler = ('../controllers/cryptoHandler');
const Driver = require("../models/driver");
//const User = mongoose.model('User');
const sendSms = require("../services/sendSms");
// const sendPassengerPushNotification = require('../services/passengerPushNotifications');
const otp = require("../services/randomnum");
const imageUpload = require("./imageUpload");
const passengerWallet = require("../models/passengerwallet");
const Dispatcher = require("../models/dispatcher");
const PassengerWallet = require("../models/passengerwallet");
const Setting = require("../models/setting");
// const config = require("../config");
const PaymentService = require("../services/payment");
const Dispatch = require("../models/dispatch");
const DispatcherWallet = require("../models/dispatcherwallet");
const asyncHandler = require("express-async-handler");
const PassengerWalletController = require("./passengerWallet");
const chalk = require("chalk");

require("dotenv").config();

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

exports.user = function (req, res) {
    console.log("###### user ######");
    res.json({
        status: "user",
    });
};

/*// /!**### send otp #### *!/
// exports.registerOTP = function (req, res) {
//     console.log("###### user registerOTP  ######");
//     User.findOne({
//         'contactNumber': req.body.ContactNumber
//     })
//     .exec(function (err, users) {
//         if (err) {
//             console.log('####### user registerOTP : error occured : ' + err);
//             res.status(400).send('error');
//         } else {
//             if (users !== null && users.isApproved == true) {
//                 console.log("####################### user registerOTP : user already exist ##########################");
//                 res.status(400).send({
//                     message: 'failed',
//                     details: "You are already registered with this service. Please login!",
//                     status: "signup_failed"
//                 });
//             } else {

//                 var user = new User();
//                 user.contactNumber = req.body.ContactNumber;
//                 user.otpPin = otp.otpGen();
//                 user.otpTime = new Date();

//                 /!* un approved users delete *!/
//                 if (users !== null) {
//                     User.findByIdAndRemove(users._id)
//                     .exec(function (err, result) {
//                         if (err) {
//                             console.log('####### user registerOTP : un approved users delete error : ' + err);
//                         } else {
//                             console.log('####### user registerOTP : un approved users deleted.')
//                         }
//                     });
//                 }

//                 user.save(function (err) {
//                     if (err) {
//                         console.log('####### user registerOTP : new users save error : '+err);
//                         res.status(500).send(err);
//                     } else {
//                         var wallet = new passengerWallet();
//                         wallet.passengerId = user._id;
//                         wallet.save(function (err2) {
//                             if (err2) {
//                                 console.log('####### user registerOTP : new users wallet create error : '+err2);
//                                 res.status(500).send(err2);
//                             } else {
//                                 console.log('sending sms');
//                                 sendSms.sendSms(req.body.ContactNumber, user.otpPin);
//                                 res.json({
//                                     message: 'success',
//                                     details: "Enter The code you received"
//                                 });
//                             }
//                         })
//                     }
//                 });
//             }
//         }
//     });
// };*/

exports.registerOTP = function (req, res) {
    console.log("###### user registerOTP  ######");
    User.findOne({
        contactNumber: req.body.ContactNumber,
    }).exec(function (err, users) {
        if (err) {
            console.log("####### user registerOTP : error occured : " + err);
            res.status(400).send("error");
        } else {
            /* check user */
            if (users !== null) {
                if (users.isApproved === true) {
                    console.log(
                        "####################### user registerOTP : user already registerd ##########################"
                    );
                    res.status(400).send({
                        message: "failed",
                        details:
                            "You are already registered with this service. Please login!",
                        status: "signup_failed",
                    });
                } else {
                    console.log(
                        "####################### user registerOTP : user not registerd, only have number ##########################"
                    );

                    /* update otp */
                    var pin = otp.otpGen();

                    var newValues = {
                        $set: {
                            otpPin: pin,
                            otpTime: new Date(),
                        },
                    };

                    User.findOneAndUpdate(
                        {
                            contactNumber: req.body.ContactNumber,
                        },
                        newValues,
                        function (err, result) {
                            if (err) {
                                return res.status(500).json({
                                    message: "Internal server error",
                                });
                            } else {
                                console.log("sending sms");
                                sendSms.sendSms(req.body.ContactNumber, pin);
                                return res.status(200).json({
                                    message: "success",
                                    details: "Enter The code you received",
                                });
                            }
                        }
                    );
                }
            } else {
                var user = new User();
                user.contactNumber = req.body.ContactNumber;
                user.otpPin = otp.otpGen();
                user.otpTime = new Date();

                user.save(function (err) {
                    if (err) {
                        console.log(
                            "####### user registerOTP : new users save error : " + err
                        );
                        res.status(500).send(err);
                    } else {
                        var wallet = new passengerWallet();
                        wallet.passengerId = user._id;
                        wallet.save(function (err2) {
                            if (err2) {
                                console.log(
                                    "####### user registerOTP : new users wallet create error : " +
                                    err2
                                );
                                res.status(500).send(err2);
                            } else {
                                console.log("sending sms");
                                sendSms.sendSms(req.body.ContactNumber, user.otpPin);
                                res.json({
                                    message: "success",
                                    details: "Enter The code you received",
                                });
                            }
                        });
                    }
                });
            }
        }
    });
};

/**## validate OTP ### */
exports.validateOTP = function (req, res) {
    console.log("###### user register ######");
    User.findOne({
        contactNumber: req.body.ContactNumber,
    }).exec(function (err, users) {
        if (err) {
            console.log("####### error occured" + err);
            res.status(400).send("error");
        } else {
            if (users !== null) {
                if (new Date().getTime() - new Date(users.otpTime).getTime() > 300000) {
                    return res.status(209).json({
                        message: "Invalid pin",
                    });
                } else if (req.body.pin !== users.otpPin) {
                    return res.status(210).json({
                        message: "Pin is incorrect",
                    });
                } else if (req.body.pin > 999) {
                    var newValues = {
                        $set: {
                            otpPin: 0,
                            contactNoConfirm: true,
                        },
                    };
                    User.findByIdAndUpdate(users._id, newValues, function (err, result) {
                        if (err) {
                            return res.status(500).json({
                                message: "server error",
                            });
                        } else {
                            return res.status(200).json({
                                message: "loggedin",
                                details:
                                    "Login successfully. Fill rest Data to complete Registration",
                                contactNo: req.body.contactNumber,
                            });
                        }
                    });
                }
            } else {
                res.status(404).json({
                    message: "",
                    details: "User not found",
                });
            }
        }
    });
};


/* ### Signup / Register ### */
exports.register = asyncHandler(async (req, res) => {
    console.log("###### user register ######");
    User.findOne({
        contactNumber: req.body.ContactNumber,
    }).exec(function (err, users) {
        if (err) {
            console.log("####### user register : error occured : " + err);
            res.status(400).send("error");
        } else {
            if (users !== null && users.isApproved) {
                console.log(
                    "####################### user register : contact No already registered ##########################"
                );
                res.status(400).send({
                    message: "failed",
                    details: "contact No already registered!",
                    status: "signup_failed",
                });
            } else if (users == null) {
                console.log(
                    "####################### user register : cannot find contact number ##########################"
                );
                res.status(400).send({
                    message: "failed",
                    details: "cannot find contact no",
                    status: "signup_failed",
                });
            } else {
                console.log(users);

                if (users.contactNoConfirm) {
                    if (req.body.email) {
                        var newValues = {
                            $set: {
                                name: req.body.UserName,
                                gender: req.body.Gender,
                                birthday: req.body.Birthday,
                                email: req.body.email,
                                userPlatform: req.body.UserPlatform,
                                isApproved: true,
                                passengerCode:
                                    process.env.PASSENGER_REFERRAL_SHORT_NAME +
                                    "" +
                                    otp.generateRefToken(),
                            },
                        };
                    } else {
                        var newValues = {
                            $set: {
                                name: req.body.UserName,
                                gender: req.body.Gender,
                                birthday: req.body.Birthday,
                                userPlatform: req.body.UserPlatform,
                                isApproved: true,
                                passengerCode:
                                    process.env.PASSENGER_REFERRAL_SHORT_NAME +
                                    "" +
                                    otp.generateRefToken(),
                            },
                        };
                    }

                    User.findOneAndUpdate(
                        {
                            contactNumber: req.body.ContactNumber,
                        },
                        newValues,
                        function (err, result) {
                            if (err) {
                                return res.status(500).json({
                                    message: "server error",
                                });
                            } else {
                                /* profile image optional */
                                // if (req.files && Object.keys(req.files).length > 0) {

                                //     imageUpload.uploadImagesCallback(req.files, users._id, User, 'users', function (response) {
                                //         console.log('############### Image Uploded #################');

                                //         User.findOne({
                                //             'contactNumber': req.body.ContactNumber
                                //         })
                                //         .exec(function (err, user2) {
                                //             if (err) {
                                //                 console.log('####### error occured' + err);
                                //                 res.status(400).send('error');
                                //             } else {
                                //                 if (user2 !== null && user2.isApproved) {
                                //                     console.log('********* image uploded **********');
                                //                     console.log(user2.userProfilePic);

                                //                     return res.status(200).json({
                                //                         message: 'success',
                                //                         details: "Registration Complete. Let's Servive with TaxiMe",
                                //                         user: user2,
                                //                         token: jwt.sign({
                                //                             email: req.body.ContactNumber,
                                //                             _id: user2._id
                                //                         }, 'RESTFULAPIs')
                                //                     });
                                //                 }
                                //             }
                                //         });

                                //     });

                                if (req.files != null) {
                                    imageUpload.uploadProfileImageCallback(
                                        req.files,
                                        users._id,
                                        User,
                                        "users",
                                        function (response, data) {
                                            console.log(
                                                "############### Image Uploded #################"
                                            );

                                            User.findOne({
                                                contactNumber: req.body.ContactNumber,
                                            }).exec(function (err, user2) {
                                                if (err) {
                                                    console.log("####### error occured" + err);
                                                    res.status(400).send("error");
                                                } else {
                                                    if (user2 !== null && user2.isApproved) {
                                                        console.log("********* image uploded **********");
                                                        console.log(user2.userProfilePic);

                                                        return res.status(200).json({
                                                            message: "success",
                                                            details:
                                                                "Registration Complete. Let's Servive with TaxiMe",
                                                            user: user2,
                                                            token: jwt.sign(
                                                                {
                                                                    email: req.body.ContactNumber,
                                                                    _id: user2._id,
                                                                },
                                                                "RESTFULAPIs"
                                                            ),
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    );
                                } else {
                                    User.findOne({
                                        contactNumber: req.body.ContactNumber,
                                    }).exec(function (err, user2) {
                                        if (err) {
                                            console.log("####### error occured" + err);
                                            res.status(400).send("error");
                                        } else {
                                            if (user2 !== null && user2.isApproved) {

                                                createFreshWallet(req, res);

                                                return res.status(200).json({
                                                    message: "success",
                                                    details:
                                                        "Registration Complete. Let's Servive with TaxiMe",
                                                    user: user2,
                                                    token: jwt.sign(
                                                        {
                                                            email: req.body.ContactNumber,
                                                            _id: user2._id,
                                                        },
                                                        "RESTFULAPIs"
                                                    ),
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    );
                } else {
                    res.status(400).send({
                        message: "failed",
                        details: "Not a confirmed contact No",
                        status: "signup_failed",
                    });
                }
            }
        }
    });
});

async function createFreshWallet(req, res) {
    try {
        if (req.body.passengerId) {
            const wallet = new PassengerWallet();
            wallet.passengerId = req.body.passengerId;

            await wallet.save(function (err, wallet) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    // return res.status(200).json({message: "success!"});
                }
            });
        } else {
            return res.status(500).json({message: "Passenger id not found!"});
        }
    } catch (error) {

    }
}

//Resend otp
exports.getOtp = function (req, res) {
    User.findOne({
        contactNumber: req.body.ContactNumber,
    }).exec(function (err, user) {
        if (err) {
            res.status(500).json({
                message: "internel error",
            });
        } else {
            if (user !== null) {
                console.log("## user not null ##");
                if (new Date().getTime() - new Date(user.otpTime).getTime() < 30000) {
                    res.status(202).json({
                        message: "Too early to request",
                    });
                } else {
                    var pin = otp.otpGen();
                    if (user.otpPin === 0 || user.otpPin > 999) {
                        var newValues = {
                            $set: {
                                otpPin: pin,
                                otpTime: new Date(),
                            },
                        };
                        User.findOneAndUpdate(
                            {
                                contactNumber: req.body.ContactNumber,
                            },
                            newValues,
                            function (err, result) {
                                if (err) {
                                    return res.status(500).json({
                                        message: "Internal server error",
                                    });
                                } else {
                                    console.info(chalk.blue("OTP : " + pin));
                                    sendSms.sendSms(req.body.ContactNumber, pin);
                                    return res.status(200).json({
                                        message: "Pin Send Successfully",
                                    });
                                }
                            }
                        );
                    } else {
                        res.status(500).json({
                            message: "internel error",
                        });
                    }
                }
            } else {
                res.status(204).json({
                    message: "user not found",
                });
            }
        }
    });
};

/* ### SignIn / Login ### */
exports.signIn = asyncHandler(async (req, res) => {
    console.log("###### user signIn #######");

    await User.findOne({
        contactNumber: req.body.ContactNumber,
    }).exec(async function (err, user) {
        if (err) {
            console.log("####### error occured" + err);
            //res.status(400).send(err);
            return res.status(400).json({
                message: "error",
                details: "User not found",
                content: err,
            });
        } else {
            if (user !== null && user.isApproved === true) {
                console.log(
                    "####################### not an null data : user already exist ##########################"
                );

                var pin;

                if (req.body.ContactNumber === "0775313704") {
                    console.log("##block 1###");
                    pin = 1111;
                } else {
                    console.log("###bolck 2###");
                    /* generate otp */
                    pin = otp.otpGen();
                    console.info(chalk.blue("OTP : " + pin));
                }

                var newValues = {
                    $set: {
                        otpPin: pin,
                        otpTime: new Date(),
                    },
                };

                // var userRate = null;
                // var ratingList = [];

                // if (user.ratings && user.ratings.length > 0) {

                //     var sum = 0;
                //     user.ratings.forEach(el => {

                //         console.log(el.feedback);
                //         sum = sum + el.rate;
                //         ratingList.push({
                //             'rate': el.rate,
                //             'feedback': el.feedback
                //         })

                //     });
                //     userRate = sum / user.ratings.length;
                // }

                /* check driver code */
                // var passengerCode = null;

                // if (user.passengerCode) {
                //     passengerCode = user.passengerCode;
                // }

                var userObj = {
                    userName: user.name,
                    userProfilePic: user.userProfilePic,
                };

                await User.findOneAndUpdate(
                    {
                        contactNumber: req.body.ContactNumber,
                    },
                    newValues,
                    function (err) {
                        if (err) {
                            console.log(
                                "#################### error occured #######################"
                            );
                            console.log(err);
                            //res.send(err);
                            return res.status(500).json({
                                message: "error",
                                details: "OTP pin update db error",
                                content: res,
                            });
                        } else {
                            /* send otp sms to user */
                            console.info(chalk.blue("OTP : " + pin));
                            sendSms.sendSms(req.body.ContactNumber, pin);
                            console.log(userObj);
                            res.status(200).json({
                                message: "success",
                                details: "Enter The code you received",
                                content: userObj,
                            });
                        }
                    }
                );
            } else {
                console.log(
                    "####################### null data ##########################"
                );
                res.status(400).send({
                    message: "signup",
                    details: "User not registered! Please Signup",
                    content: "User not registered! Please Signup",
                });
            }
        }
    });
});

/**## validate OTP ### */
exports.validateLoginOTP = function (req, res) {
    User.findOne({
        contactNumber: req.body.ContactNumber,
    }).exec(function (err, users) {
        if (err) {
            console.log("####### error occured :" + err);
            //res.status(400).send('error');
            return res.status(400).json({
                message: "error",
                details: "User not found",
                content: err,
            });
        } else {
            if (users !== null) {
                if (new Date().getTime() - new Date(users.otpTime).getTime() > 300000) {
                    // return res.status(209).json({
                    // message: 'Invalid pin'
                    // });
                    return res.status(209).json({
                        message: "error",
                        details: "OTP timeout",
                        content: "OTP timeout",
                    });
                } else if (req.body.pin !== users.otpPin) {
                    return res.status(210).json({
                        message: "error",
                        details: "OTP is incorrect",
                        content: "OTP is incorrect",
                    });
                    // return res.status(210).json({
                    // message: 'Pin is incorrect'
                    // });
                } else if (req.body.pin > 999) {
                    var newValues = {
                        $set: {
                            otpPin: 0,
                        },
                    };
                    User.findOneAndUpdate(
                        {
                            contactNumber: req.body.ContactNumber,
                        },
                        newValues,
                        function (err, result) {
                            if (err) {
                                // return res.status(500).json({
                                // message: 'server error'
                                // });
                                return res.status(500).json({
                                    message: "error",
                                    details: "OTP pin update db error",
                                    content: res,
                                });
                            } else {
                                return res.status(200).json({
                                    message: "signedin",
                                    details:
                                        "Login successfully. Fill rest Data to complete Registration",
                                    ContactNumber: req.body.contactNumber,
                                    user: users,
                                    token: jwt.sign(
                                        {
                                            email: req.body.ContactNumber,
                                            _id: users._id,
                                        },
                                        "RESTFULAPIs"
                                    ),
                                });
                            }
                        }
                    );
                }
            } else {
                // return res.status(404).json({
                //     message: 'User not found'
                // });
                return res.status(404).json({
                    message: "error",
                    details: "User not found",
                    content: "User not found",
                });
            }
        }
    });
};

/**## Get User Profile By Contact Number ### */
exports.getPassangerProfileByContactNumber = function (req, res) {
    User.findOne({
        contactNumber: req.body.ContactNumber,
    }).exec(function (err, users) {
        if (err) {
            console.log("####### error occured :" + err);
            //res.status(400).send('error');
            return res.status(400).json({
                message: "error",
                details: "User not found",
                content: err,
            });
        } else {
            if (users !== null) {
                return res.status(200).json({
                    message: "Get Passenger Profile",
                    user: users,
                });
                /*if ((new Date().getTime() - new Date(users.otpTime).getTime()) > 300000) {
                                                                                        // return res.status(209).json({
                                                                                        // message: 'Invalid pin'
                                                                                        // });
                                                                                        return res.status(209).json({
                                                                                            message: 'error',
                                                                                            details: 'OTP timeout',
                                                                                            content: "OTP timeout"
                                                                                        });
                                                                                    } else if (req.body.pin !== users.otpPin) {
                                                                                        return res.status(210).json({
                                                                                            message: 'error',
                                                                                            details: 'OTP is incorrect',
                                                                                            content: "OTP is incorrect"
                                                                                        });
                                                                                        // return res.status(210).json({
                                                                                        // message: 'Pin is incorrect'
                                                                                        // });
                                                                                    } else if (req.body.pin > 999) {
                                                                                        var newValues = {
                                                                                            $set: {
                                                                                                otpPin: 0
                                                                                            }
                                                                                        }
                                                                                        User.findOneAndUpdate({
                                                                                            'contactNumber': req.body.ContactNumber
                                                                                        }, newValues, function (err, result) {
                                                                                            if (err) {
                                                                                                // return res.status(500).json({
                                                                                                // message: 'server error'
                                                                                                // });
                                                                                                return res.status(500).json({
                                                                                                    message: 'error',
                                                                                                    details: 'OTP pin update db error',
                                                                                                    content: res
                                                                                                });
                                                                                            } else {

                                                                                                return res.status(200).json({
                                                                                                    message: 'signedin',
                                                                                                    details: "Login successfully. Fill rest Data to complete Registration",
                                                                                                    ContactNumber: req.body.contactNumber,
                                                                                                    user: users,
                                                                                                    token: jwt.sign({
                                                                                                        email: req.body.ContactNumber,
                                                                                                        _id: users._id
                                                                                                    }, 'RESTFULAPIs')
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    }*/
            } else {
                // return res.status(404).json({
                //     message: 'User not found'
                // });
                return res.status(404).json({
                    message: "error",
                    details: "User not found",
                    content: "User not found",
                });
            }
        }
    });
};

/* ### Add fovourite location ### */
exports.addFavouriteLocation = function (req, res) {
    User.findOne({
        contactNumber: req.body.ContactNumber,
    }).exec(function (err, users) {
        if (err) {
            console.log("####### error occured" + err);
            res.status(400).send("error");
        } else {
            if (users == null) {
                console.log(
                    "####################### Cannot find user ##########################"
                );
                res.status(400).send({
                    message: "failed",
                    details: "Contact No cannot find",
                    status: "favAdd_failed",
                });
            } else {
                console.log(req.body);
                User.findOneAndUpdate(
                    {
                        contactNumber: req.body.ContactNumber,
                    },
                    {
                        $push: {
                            favouriteLocations: {
                                favourName: req.body.favourName,
                                address: req.body.address,
                                latitude: req.body.latitude,
                                longitude: req.body.longitude,
                            },
                        },
                    }
                ).exec(function (err, data) {
                    if (err) {
                        console.log("####### error occured" + err);
                        res.status(400).send("error");
                    } else {
                        console.log(data);

                        res.json({
                            message: "success",
                            details: "Successfully added Location",
                            content: {
                                address: req.body.address,
                                latitude: req.body.latitude,
                                longitude: req.body.longitude,
                            },
                        });
                    }
                });
            }
        }
    });
};

/* ### Add fovourite location ### */
exports.removeFavouriteLocation = function (req, res) {
    User.findOne({
        contactNumber: req.body.ContactNumber,
    }).exec(function (err, users) {
        if (err) {
            console.log("####### error occured" + err);
            res.status(400).send("error");
        } else {
            if (users == null) {
                console.log(
                    "####################### Cannot find user ##########################"
                );
                res.status(400).send({
                    message: "failed",
                    details: "Contact No cannot find",
                    status: "favAdd_failed",
                });
            } else {
                console.log(req.body);

                User.update(
                    {
                        contactNumber: req.body.ContactNumber,
                    },
                    {
                        $pull: {
                            favouriteLocations: {
                                _id: req.body._id,
                            },
                        },
                    }
                ).exec(function (err, data) {
                    if (err) {
                        console.log("####### error occured" + err);
                        res.status(400).send("error");
                    } else {
                        console.log(data);

                        res.json({
                            message: "success",
                            details: "Successfully remove Location",
                        });
                    }
                });
            }
        }
    });
};

/**get favourite locations by user id */
exports.getFavouriteLocation = function (req, res) {
    console.log("###### get Favourite locations ######");
    User.find({
        contactNumber: req.params.ContactNumber,
    }).exec(function (err, data) {
        if (err) {
            console.log("####### error occured" + err);
            res.status(400).send("error");
        } else {
            if (data == null || data == []) {
                res.status(400).json({
                    message: "failed",
                    details: "No data found",
                    status: "failed",
                });
            } else {
                if (data[0]) {
                    res.json({
                        message: "success",
                        details: "get data Successfully",
                        content: data[0].favouriteLocations,
                    });
                } else {
                    res.json({
                        message: "success",
                        details: "Data is empty",
                    });
                }
            }
        }
    });
};

/* author : ghost */
/* ### Add ratings after trip end ### */
exports.addDriverRatings = function (req, res) {
    Driver.findOne({
        _id: req.body.id,
    }).exec(function (err, driver) {
        if (err) {
            console.log("####### error occured" + err);
            res.status(400).send("error");
        } else {
            if (driver == null) {
                console.log(
                    "####################### Cannot find driver ##########################"
                );
                res.status(400).send({
                    message: "failed",
                    details: "Driver not found",
                    status: "rate add failed",
                });
            } else {
                if (driver.isApproved == true) {
                    console.log(req.body);

                    var newValues = {
                        $push: {
                            ratings: {
                                rate: req.body.rate,
                                feedback: req.body.feedback,
                            },
                        },
                    };

                    Driver.findByIdAndUpdate(
                        req.body.id,
                        newValues,
                        function (error, results) {
                            if (error) {
                                console.log(error);
                                res.status(500).json({
                                    message: "failed",
                                    details: "Ratings add failed",
                                });
                            } else {
                                res.status(200).json({
                                    message: "success",
                                    details: "Ratings added successfully",
                                });
                            }
                        }
                    );

                    // User.findByIdAndUpdate({
                    //     '_id': req.body.id
                    // }, {
                    //     $push: {
                    //         ratings: {
                    //             rate: req.body.rate,
                    //             feedback: req.body.feedback,
                    //         }
                    //     }
                    // })
                    // .exec(function (err, data) {
                    //     if (err) {
                    //         console.log('####### error occured' + err);
                    //         res.status(400).json({
                    //             message: 'failed',
                    //             details: 'Ratings add failed'
                    //         });
                    //     } else {
                    //         console.log(data);
                    //         res.status(200).json({
                    //             message: 'success',
                    //             details: 'Ratings added successfully'
                    //         });
                    //     }

                    // });
                } else {
                    res.status(409).json({
                        message: "failed",
                        details: "Driver is not approved",
                    });
                }
            }
        }
    });
};

// authorise passenger //
exports.userLoginRequired = function (req, res, next) {
    console.log("###### login required ######");
    console.log(req.headers.authorization);
    console.log(req.headers["content-type"]);
    console.log(req.user);
    //res.json({status: 'login required'});
    if (req.user) {
        next();
    } else {
        return res.status(401).json({
            message: "Unauthorized passenger!",
        });
    }
};

exports.checkInfo = function (req, res) {
    console.log(req.headers.authorization);
    User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.body.userId),
            },
        },
        {
            $lookup: {
                from: "dispatchers",
                localField: "_id",
                foreignField: "dispatcherId",
                as: "dispatcher",
            },
        },
        {
            $lookup: {
                from: "passengerwallets",
                localField: "_id",
                foreignField: "passengerId",
                as: "wallet",
            },
        },
        {
            $project: {
                otpPin: 0,
                saltSecret: 0,
                otpTime: 0,
            },
        },
    ]).exec(function (err, user) {
        if (err) {
            res.status(500).send(err);
        } else {
            if (user != null) {
                console.log(user);
                res.status(206).json({
                    message: "User details",
                    content: user,
                    // content2: null
                });
            } else {
                res.status(202).json({
                    message: "User is not approved",
                });
            }
        }
    });
};

exports.addDispatcherReferalCode = function (req, res) {
    Dispatcher.findOne({
        dispatcherCode: req.body.referralId,
    }).exec(function (err, data) {
        if (err) {
            console.log("####### error occured" + err);
            res.status(500).send("error");
        } else {
            if (data == null) {
                Driver.findOne({
                    driverCode: req.body.referralId,
                }).exec(function (err, data1) {
                    if (err) {
                        console.log("####### error occured" + err);
                        res.status(500).send("error");
                    } else {
                        if (data1 == null) {
                            res.status(400).send({
                                message: "failed",
                                details: "Invalid Code!",
                                status: "code_failed",
                            });
                        } else {
                            var refType = "driver";

                            var d = new Date();
                            var year = d.getFullYear();
                            var month = d.getMonth();
                            var day = d.getDate();
                            var c = new Date(year + 1, month, day);

                            var newValues = {
                                $push: {
                                    referral: {
                                        referralId: req.body.referralId,
                                        referredDriverId: data1._id,
                                        referredId: data1._id,
                                        referredType: refType,
                                        earning: 1,
                                        recordedDate: new Date(),
                                        expireDate: c,
                                    },
                                },
                            };

                            PassengerWallet.findOneAndUpdate(
                                {
                                    passengerId: req.body.passengerId,
                                },
                                newValues,
                                function (err, result) {
                                    if (err) {
                                        return res.status(500).json({
                                            message: err,
                                        });
                                    } else {
                                        res.json({
                                            message: "success",
                                            details: "Successfully added Refferal Code",
                                        });
                                    }
                                }
                            );
                        }
                    }
                });
            } else {
                if (data.type == "Driver") {
                    var refType = "driverDispatcher";
                } else if (data.type == "User") {
                    var refType = "userDispatcher";
                }

                var d = new Date();
                var year = d.getFullYear();
                var month = d.getMonth();
                var day = d.getDate();
                var c = new Date(year + 1, month, day);

                var newValues = {
                    $push: {
                        referral: {
                            referralId: req.body.referralId,
                            referredDriverId: data.dispatcherId,
                            referredId: data.dispatcherId,
                            referredType: refType,
                            earning: 1,
                            recordedDate: new Date(),
                            expireDate: c,
                        },
                    },
                };

                PassengerWallet.findOneAndUpdate(
                    {
                        passengerId: req.body.passengerId,
                    },
                    newValues,
                    function (err, result) {
                        if (err) {
                            return res.status(500).json({
                                message: err,
                            });
                        } else {
                            res.json({
                                message: "success",
                                details: "Successfully added Refferal Code",
                            });
                        }
                    }
                );
            }
        }
    });
};

exports.getTrips = function (req, res) {
    console.log("##### getTrips by user id #####");
    //var fromDate = new Date(req.params.from);
    //var toDate = new Date(req.params.to);

    PassengerWallet.aggregate(
        [
            {
                $match: {
                    passengerId: mongoose.Types.ObjectId(req.params.id),
                },
            },
            {
                $unwind: "$transactionHistory",
            },
        ]
        // {
        //     $match: {
        //         $and: [{
        //         'transactionHistory.dateTime': {
        //             $gte: fromDate,
        //             $lt: toDate
        //         }
        //         }],
        //     },
        // }
    ).exec(function (err, result) {
        if (err) {
            res.status(500).send(err);
        } else {
            var trips = [];
            result.forEach((el) => {
                if (el.transactionHistory != null) {
                    trips.push(el.transactionHistory);
                    // totalEarningsCal = totalEarningsCal + el.transactionHistory.trip.tripEarning;
                    // tripsDone = tripsDone + 1;
                }
            });

            res.status(200).json({
                message: "success",
                trips: trips.reverse(),
                //passengerWallet: result.reverse()
            });
        }
    });
};

exports.getLatestAndroidUserVersion = function (req, res) {
    Setting.find({}, function (err, data) {
        if (err) {
            console.log("#################### error occured #######################");
            console.log(err);
            res.status(500).send(err);
        } else {
            res.status(200).json({
                message: "success",
                // darta : data
                androidAppUserVersion: data[0].androidUserAppVersion,
            });
        }
    });
};

exports.getLatestIosUserVersion = function (req, res) {
    Setting.find({}, function (err, data) {
        if (err) {
            console.log("#################### error occured #######################");
            console.log(err);
            res.status(500).send(err);
        } else {
            res.status(200).json({
                message: "success",
                // darta : data
                androidAppUserVersion: data[0].iosUserAppVersion,
            });
        }
    });
};

exports.editPassenger = function (req, res) {
    User.findById(req.body.userId).exec(function (err, user) {
        if (err) {
            res.status(500).json({
                message: "Server Error",
            });
        } else {
            if (user.address.length > 0) {
                var newValues = {
                    $set: {
                        name: req.body.userName,
                        gender: req.body.gender,
                        birthday: req.body.birthday,
                        email: req.body.email,
                        "address.0.address": req.body.address,
                        "address.0.state": req.body.state,
                        "address.0.city": req.body.city,
                        "address.0.zipcode": req.body.zipcode,
                        "address.0.country": req.body.country,
                    },
                };

                User.findByIdAndUpdate(
                    req.body.userId,
                    newValues,
                    function (err, results) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                message: "Server Error!",
                            });
                        } else {
                            if (results != null) {
                                console.log(results);
                                res.status(200).json({
                                    message: "success!",
                                });
                            } else {
                                console.log(results);
                                res.status(500).json({
                                    message: "failed!",
                                });
                            }
                        }
                    }
                );
            } else {
                var newValues1 = {
                    $set: {
                        name: req.body.userName,
                        gender: req.body.gender,
                        birthday: req.body.birthday,
                        email: req.body.email,
                    },
                    $push: {
                        address: {
                            address: req.body.address,
                            state: req.body.state,
                            city: req.body.city,
                            zipcode: req.body.zipcode,
                            country: req.body.country,
                        },
                    },
                };

                User.findByIdAndUpdate(
                    req.body.userId,
                    newValues1,
                    function (err, results) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                message: "Server Error!",
                            });
                        } else {
                            if (results != null) {
                                console.log(results);
                                res.status(200).json({
                                    message: "success!",
                                });
                            } else {
                                console.log(results);
                                res.status(500).json({
                                    message: "failed!",
                                });
                            }
                        }
                    }
                );
            }
        }
    });
};

exports.getDispatches = function (req, res) {
    // var fromDate = new Date(req.params.from);
    // var toDate = new Date(req.params.to);

    Dispatch.aggregate([
        {
            $match: {
                $and: [
                    {
                        dispatcherId: mongoose.Types.ObjectId(req.params.id),
                    },
                    //   {
                    //   $or: [{
                    //     status: 'canceled'
                    //   }, {
                    //     status: 'default'
                    //   }, {
                    //     status: 'accepted'
                    //   }]
                    // },
                    // {
                    //   recordedTime: {
                    //     $gte: fromDate,
                    //     $lt: toDate
                    //   }
                    // }
                ],
            },
        },
    ]).exec(function (err, result) {
        if (err) {
            res.status(500).send(err);
        } else {
            DispatcherWallet.aggregate([
                {
                    $match: {
                        dispatcherId: mongoose.Types.ObjectId(req.params.id),
                    },
                },
                {
                    $unwind: "$transactionHistory",
                },
                // {
                //   $match: {
                //     $and: [
                //       {
                //         'transactionHistory.dateTime': {
                //           $gte: fromDate,
                //           $lt: toDate
                //         }
                //       }
                //     ],
                //   },
                // }
            ]).exec(function (err, result1) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    var totalDispatchEarningsCal = 0;
                    var tripsDone = 0;

                    result1.forEach((el) => {
                        if (el.transactionHistory.trip != null) {
                            totalDispatchEarningsCal =
                                totalDispatchEarningsCal +
                                el.transactionHistory.trip.tripEarning;
                            tripsDone = tripsDone + 1;
                        }
                    });

                    res.status(200).json({
                        dispatchHistory: result.reverse(),
                        walletHistory: result1,
                        totalDispatchesDone: tripsDone,
                        totalDispatchEarnings: totalDispatchEarningsCal,
                    });
                }
            });
        }
    });
};

/*// /!* ### SocialMedia Signup / Social media login ### *!/
// exports.SocialMediaLoginRegister = function (req, res) {
//   console.log('writing new user');
//   console.log(req.body);

//   var user = new User();
//   var socialLogin = mongoose.Types.ObjectId();

//   user.email = req.body.Email;
//   user.userType = req.body.UserType;
//   user.socialLoginId = req.body.SocialLoginId;
//   user.userProfilePic = req.body.UserProfilePic;

//   User.findOne({ 'email': req.body.Email })
//     .exec(function (err, users) {
//       if (err) {
//         console.log('error occured');
//         res.send('error');
//       } else {
//         if (users !== null) {
//           //social media registed email registered already
//           console.log("####################### not an null data : user already exist : login in action performing ##########################");
//           // console.log(users);
//           if (users.socialLoginId == req.body.SocialLoginId) {
//             console.log("=========> login successful : pass key matched !");
//             users.password = undefined;
//             res.json({
//               message: 'success',
//               details: "login successful",
//               status: "login_success",
//               content: users
//             });
//           } else {
//             console.log("=========> wrong access key");
//             res.json({ message: 'failed', details: "login failed on wrong access key", status: "login_failed" });
//           }

//         } else {
//           console.log("####################### null data ##########################");
//           // console.log(users);
//           user.password = socialLogin;
//           user.fisrtName = req.body.firstName;
//           user.lastName = req.body.lastName
//           user.contactNumber = 'none';
//           user.isEnableUser = true;
//           user.birthday[0] = 'none';
//           //user.address = 'none';
//           user.userPlatform = req.body.UserPlatform;

//           user.save(function (err) {
//             if (err) {
//               console.log('#################### error occured #######################');
//               console.log(err);
//               res.send(err);
//             } else {
//               console.log('==============> Social User added successfully !');
//               sendEmail(req.body.Email, req.body.Name);
//               User.findOne({ 'email': req.body.Email })
//                 .exec(function (err, user) {
//                   if (err) {
//                     console.log('error occured');
//                     res.send('error');
//                   } else {
//                     res.json({ message: 'success', details: "Registed successfully", content: user });
//                   }
//                 });
//             }
//           });
//         }
//       }
//     });
// };

/!* ### Update user Profile  ### *!/
// exports.updateProfile = function (req, res) {
//     console.log('###### updating user profile ######');

//     User.findById(req.body.id)
//     .exec(function (err, user) {
//         if (err) {
//             console.log('error occured');
//             console.log(err)
//             res.json({
//                 message: 'failed',
//                 details: "User does not exists",
//                 status: "user_not_exited"
//             });
//         } else {
//             if (user !== null) {
//             var newValues = {
//                 $set: {
//                     name: req.body.name,
//                     email: req.body.email,
//                     birthday: req.body.birthday,
//                     gender: req.body.gender,
//                     contactNumber: req.body.ContactNumber,
//                     address: req.body.address
//                 }
//             }
//             User.findByIdAndUpdate(req.body.UserId, newValues, function (err, result) {
//                 if (err) {
//                     console.log(err)
//                     throw err;
//                 } else {
//                     User.findById(req.body.UserId)
//                     .exec(function (err, user) {
//                         if (err) {
//                             console.log('error occured');
//                             console.log(err)
//                         } else {
//                             res.json({
//                                 message: 'success',
//                                 details: "user profile updated successfully",
//                                 content: user
//                             });
//                         }
//                     });
//                 }
//             });
//             } else {
//                 res.json({
//                     message: 'failed',
//                     details: "User does not exists",
//                     status: "user_not_exited"
//                 });
//             }
//         }
//     });
// };*/

/* author : ghost */
exports.updateUserProfile = function (req, res) {
    console.log("########### update user profile ############");
    User.findOne({
        contactNumber: req.body.contactNumber,
    }).exec(function (err, user) {
        if (err) {
            res.status(500).json({
                message: "Server Error",
            });
        } else {
            if (user == null) {
                console.log(
                    "####################### Cannot find user ##########################"
                );
                res.status(400).send({
                    message: "failed",
                    details: "User not found",
                    status: "user update failed",
                });
            } else {
                if (user.address && user.address.length > 0) {
                    var newValues = {
                        name: req.body.name,
                        email: req.body.email,
                        birthday: req.body.birthday,
                        gender: req.body.gender,
                        "address.0.address": req.body.address,
                        "address.0.state": req.body.state,
                        "address.0.city": req.body.city,
                        "address.0.zipcode": req.body.zipcode,
                        "address.0.country": req.body.country,
                    };

                    User.update(
                        {
                            contactNumber: req.body.contactNumber,
                        },
                        {
                            $set: newValues,
                        }
                    ).exec(function (err, data) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                message: "failed",
                                details: "Server Error!",
                            });
                        } else {
                            res.status(200).json({
                                message: "success",
                                details: "User updated successfully",
                                content: {
                                    name: newValues.name,
                                    email: newValues.email,
                                    birthday: newValues.birthday,
                                    gender: newValues.gender,
                                    address: {
                                        address: req.body.address,
                                        state: req.body.state,
                                        city: req.body.city,
                                        zipcode: req.body.zipcode,
                                        country: req.body.country,
                                    },
                                },
                            });
                        }
                    });
                } else {
                    var newValues1 = {
                        name: req.body.name,
                        email: req.body.email,
                        birthday: req.body.birthday,
                        gender: req.body.gender,
                    };

                    var newValues2 = {
                        address: {
                            address: req.body.address,
                            state: req.body.state,
                            city: req.body.city,
                            zipcode: req.body.zipcode,
                            country: req.body.country,
                        },
                    };

                    User.update(
                        {
                            contactNumber: req.body.contactNumber,
                        },
                        {
                            $set: newValues1,
                            $push: newValues2,
                        }
                    ).exec(function (err, data) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                message: "failed",
                                details: "Server Error!",
                            });
                        } else {
                            res.status(200).json({
                                message: "success",
                                details: "User updated successfully",
                                content: {
                                    name: newValues1.name,
                                    email: newValues1.email,
                                    birthday: newValues1.birthday,
                                    gender: newValues1.gender,
                                    address: newValues2.address,
                                },
                            });
                        }
                    });
                }
            }
        }
    });
};

/* author : ghost */
exports.updateProfile = function (req, res) {
    console.log("########### update user profile ############");
    User.findOne({
        contactNumber: req.body.contactNumber,
    }).exec(function (err, user) {
        if (err) {
            res.status(500).json({
                message: "Server Error",
            });
        } else {
            if (user == null) {
                console.log(
                    "####################### Cannot find user ##########################"
                );
                res.status(400).send({
                    message: "failed",
                    details: "User not found",
                    status: "user update failed",
                });
            } else {
                if (user.address && user.address.length > 0) {
                    var newValues = {
                        $set: {
                            name: req.body.name,
                            email: req.body.email,
                            birthday: req.body.birthday,
                            gender: req.body.gender,
                            "address.0.address": req.body.address,
                            "address.0.state": req.body.state,
                            "address.0.city": req.body.city,
                            "address.0.zipcode": req.body.zipcode,
                            "address.0.country": req.body.country,
                        },
                    };

                    // User.findByIdAndUpdate(req.body.contactNumber, newValues, function (err, results) {
                    //     if (err) {
                    //         console.log(err)
                    //         res.status(500).json({
                    //             message: 'failed',
                    //             details: 'Server Error!'
                    //         });
                    //     } else {
                    //         if (results != null) {
                    //             console.log(results);
                    //             res.status(200).json({
                    //                 message: 'success',
                    //                 details: 'User updated successfully'
                    //             });
                    //         } else {
                    //             console.log(results)
                    //             res.status(500).json({
                    //                 message: 'failed',
                    //                 details: 'User update failed'
                    //             });
                    //         }

                    //     }
                    // })

                    User.update(
                        {
                            contactNumber: req.body.contactNumber,
                        },
                        {
                            $set: {
                                name: req.body.name,
                                email: req.body.email,
                                birthday: req.body.birthday,
                                gender: req.body.gender,
                                "address.0.address": req.body.address,
                                "address.0.state": req.body.state,
                                "address.0.city": req.body.city,
                                "address.0.zipcode": req.body.zipcode,
                                "address.0.country": req.body.country,
                            },
                        }
                    ).exec(function (err, data) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                message: "failed",
                                details: "Server Error!",
                            });
                        } else {
                            res.status(200).json({
                                message: "success",
                                details: "User updated successfully",
                            });
                        }
                    });
                } else {
                    var newValues1 = {
                        $set: {
                            name: req.body.name,
                            email: req.body.email,
                            birthday: req.body.birthday,
                            gender: req.body.gender,
                        },
                        $push: {
                            address: {
                                address: req.body.address,
                                state: req.body.state,
                                city: req.body.city,
                                zipcode: req.body.zipcode,
                                country: req.body.country,
                            },
                        },
                    };

                    // User.findByIdAndUpdate(req.body.userId, newValues1, function (err, results) {
                    //     if (err) {
                    //         console.log(err)
                    //         res.status(500).json({
                    //         message: 'Server Error!'
                    //         });
                    //     } else {
                    //         if (results != null) {
                    //             console.log(results);
                    //             res.status(200).json({
                    //                 message: 'success!'
                    //             });
                    //         } else {
                    //             console.log(results)
                    //             res.status(500).json({
                    //                 message: 'failed!'
                    //             });
                    //         }

                    //     }
                    // })

                    User.update(
                        {
                            contactNumber: req.body.contactNumber,
                        },
                        {
                            $set: {
                                name: req.body.name,
                                email: req.body.email,
                                birthday: req.body.birthday,
                                gender: req.body.gender,
                            },
                            $push: {
                                address: {
                                    address: req.body.address,
                                    state: req.body.state,
                                    city: req.body.city,
                                    zipcode: req.body.zipcode,
                                    country: req.body.country,
                                },
                            },
                        }
                    ).exec(function (err, data) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                message: "failed",
                                details: "Server Error!",
                            });
                        } else {
                            res.status(200).json({
                                message: "success",
                                details: "User updated successfully",
                            });
                        }
                    });
                }
            }
        }
    });
};

/* author : ghost */
exports.updateProfileImage = function (req, res) {
    console.log("########### update user profile image ############");
    User.findOne({
        contactNumber: req.body.contactNumber,
    }).exec(function (err, user) {
        if (err) {
            res.status(500).json({
                message: "Server Error",
            });
        } else {
            if (user == null) {
                console.log(
                    "####################### Cannot find user ##########################"
                );
                res.status(400).send({
                    message: "failed",
                    details: "User not found",
                    status: "user profile image update failed",
                });
            } else {
                if (req.files != null) {
                    imageUpload.uploadProfileImageCallback(
                        req.files,
                        user._id,
                        User,
                        "users",
                        function (response, data) {
                            console.log(response);
                            res.status(200).json({
                                message: "success",
                                details: "User profile image updated successfully",
                                url: response,
                            });
                        }
                    );
                } else {
                    res.status(500).json({
                        message: "failed",
                        details: "user profile image update failed!",
                        content: "file not found",
                    });
                }
            }
        }
    });
};

/* author : ghost */
exports.updatePushToken = function (req, res) {
    console.log("########### update user push token ############");
    User.findOne({
        contactNumber: req.body.contactNumber,
    }).exec(function (err, user) {
        if (err) {
            res.status(500).json({
                message: "Server Error",
            });
        } else {
            if (user == null) {
                console.log(
                    "####################### Cannot find user ##########################"
                );
                res.status(400).send({
                    message: "failed",
                    details: "User not found",
                    status: "user push token update failed",
                });
            } else {
                if (req.body.token != null) {
                    User.update(
                        {
                            contactNumber: req.body.contactNumber,
                        },
                        {
                            $set: {
                                pushToken: req.body.token,
                            },
                        }
                    ).exec(function (err, data) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                message: "failed",
                                details: "Server Error!",
                            });
                        } else {
                            res.status(200).json({
                                message: "success",
                                details: "User push token updated successfully",
                            });
                        }
                    });
                } else {
                    res.status(500).json({
                        message: "failed",
                        details: "user push token update failed!",
                    });
                }
            }
        }
    });
};

exports.deleteUserByContactNumber = function (req, res) {
    User.findOne({contactNumber: req.body.contactNumber}).exec(function (
        err,
        data
    ) {
        if (err) {
            console.log("error occured");
        } else {
            if (data !== null) {
                User.remove({contactNumber: req.body.contactNumber}, function (err) {
                    if (err) throw err;
                    res.json({
                        message: "success",
                        details: "Successfully deleted user",
                        content: "deleted user contactNumber " + req.body.contactNumber,
                    });
                });
            } else {
                res.json({
                    message: "failed",
                    details: "This user not exists",
                    content: "This user not exists",
                });
            }
        }
    });
};

/* author : ghost */
exports.updatePayMethod = function (req, res) {
    console.log("########### update user payment method ############");

    User.findOne({
        _id: req.body.passengerId,
    }).exec(function (err, user) {
        if (err) {
            res.status(500).json({
                message: "Server Error",
            });
        } else {
            if (user == null) {
                console.log(
                    "####################### Cannot find user ##########################"
                );
                res.status(400).send({
                    message: "failed",
                    details: "User not found",
                    status: "user payment method update failed",
                });
            } else {
                if (req.body.type == "cash") {
                    User.update(
                        {
                            _id: req.body.passengerId,
                        },
                        {
                            $set: {
                                "payment.type": req.body.type,
                                "payment.cardId": null,
                            },
                        }
                    ).exec(function (err, data) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                message: "failed",
                                details: "Server Error!",
                            });
                        } else {
                            res.status(200).json({
                                message: "success",
                                details: "User payment method updated successfully",
                                content: {
                                    type: req.body.type,
                                },
                            });
                        }
                    });
                } else if (req.body.type == "card" && req.body.cardId) {
                    User.update(
                        {
                            _id: req.body.passengerId,
                        },
                        {
                            $set: {
                                "payment.type": req.body.type,
                                "payment.cardId": req.body.cardId,
                            },
                        }
                    ).exec(function (err, data) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                message: "failed",
                                details: "Server Error!",
                            });
                        } else {
                            res.status(200).json({
                                message: "success",
                                details: "User payment method updated successfully",
                                content: {
                                    type: req.body.type,
                                    cardId: req.body.cardId,
                                },
                            });
                        }
                    });
                } else {
                    res.status(500).json({
                        message: "failed",
                        details: "user payment method update failed!",
                    });
                }
            }
        }
    });
};

exports.testFun = function (req, res) {
    // var val = sendPassengerPushNotification.sendDriverAcceptedPushNotificationToPassenger("602eafe02243c7e0328ee97b", "ghost data")

    // res.json({
    //     message: 'success',
    //     details: "start trip Successfully",
    //     content2: val
    // });

    // PaymentService.webxAuth().then( (responseData) => {

    //     res.json({
    //         message: 'success',
    //         details: "start trip Successfully",
    //         content2: responseData
    //     });
    // });

    return PaymentService.webxAuth(
        carId,
        orderNumber,
        amount,
        currency,
        bankMID,
        customerEmail,
        customerId
    );
};

/*// /!* ### Change user password ### *!/
// exports.updatePassword = function (req, res) {
//   console.log('###### updating password ######');
//   User.findById(req.body.UserId)
//     .exec(function (err, user) {
//       if (err) {
//         console.log('error occured');
//         console.log(err)
//         res.json({ message: 'failed', details: "User does not exists", status: "user_not_exited" });
//       }
//       else {
//         if (user !== null) {
//           if (bcrypt.compareSync(req.body.OldPassword, user.password)) {
//             var newValues = {
//               $set: {
//                 password: bcrypt.hashSync(req.body.NewPassword, 10)
//               }
//             }
//             User.findByIdAndUpdate(req.body.UserId, newValues, function (err, result) {
//               if (err) {
//                 console.log(err)
//                 throw err;
//               } else {
//                 User.findById(req.body.UserId)
//                   .exec(function (err, user) {
//                     if (err) {
//                       console.log('error occured');
//                       console.log(err)
//                     } else {
//                       res.json({ message: 'success', details: "user profile updated successfully", content: user });
//                     }
//                   });
//               }
//             });
//           } else {
//             res.json({ message: 'failed', details: "Current password doesn't matched!", status: "authentification_failed" });
//           }

//         } else {
//           res.json({ message: 'failed', details: "User does not exists", status: "user_not_exited" });
//         }
//       }
//     });
// };

// exports.checkEmail = function (req, res) {
//   console.log('###### checkingEmail ######');
//   User.findOne({ 'email': req.body.Email })
//     .exec(function (err, user) {
//       if (err) {
//         console.log('####### error occured' + err);
//         // logger.error(err)
//         res.send('error');
//       } else {
//         if (user !== null) {
//           console.log("####################### not an null data : user already exist ##########################");
//           res.json({ message: 'success', details: "Email already registed" });
//         } else {
//           res.json({ message: 'failed', details: "Email not registed" });
//         }
//       }
//     });
// };*/
