"use strict";

const express = require("express");
// var router = express.Router();
// var app = express();
// var bodyParser = require("body-parser");
// var cors = require("cors");
// var config = require("../config");
// var Driver = require("../models/driver");
const User = require("../models/user");
// var socket = require("socket.io-client")(config.DRIVER_SOCKET_SERVER_URL);

/* author : ghost */
const adminFcmPassenger = require("firebase-admin");
const serviceAccount = require("../passengerServiceAccount.json");

adminFcmPassenger.initializeApp({
  credential: adminFcmPassenger.credential.cert(serviceAccount),
  databaseURL: "https://taxime-user.firebaseio.com",
});

const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
};

function getUserToken(id) {
  return new Promise((resolve, reject) => {
    User.findOne({
      _id: id,
    }).exec(function (err, user) {
      if (err) {
        console.log(err);
        resolve(false);
      } else {
        if (user == null) {
          console.log(
            "####################### Cannot find user ##########################"
          );

          resolve(false);
        } else {
          console.log("user.pushToken : " + user.pushToken);
          if (user.pushToken && user.pushToken != null) {
            console.log("user.pushToken1 : " + user.pushToken);
            //return user.pushToken;
            resolve(user.pushToken);
          }
          resolve(false);
        }
      }
    });
  });
}

exports.sendDriverAcceptedPushNotificationToPassenger = function (id, details) {
  const options = notification_options;

  // var message = {
  //     data: {
  //         "message":details
  //     },
  //     topic: "Trip accepted"
  // };
  var payload = {
    notification: {
      title: "Trip Accepted",
      body: details,
    },
  };

  //var pushToken = getUserToken(id);

  getUserToken(id)
    .then((val) => {
      console.log("pushToken: " + val);
      var pushToken = val;

      if (pushToken) {
        console.log("sending push notification driver details to passenger");

        adminFcmPassenger
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {
            console.log(
              "Notification driver details to passenger sent successfully"
            );
          })
          .catch((error) => {
            console.log(
              "Notification driver details to passenger sent failed: " + error
            );
          });
      } else {
        console.log("Push token not found");
      }
    })
    .catch((err) => {
      console.log("Push token not found: " + err);
    });
};

exports.sendTripCancelPushNotificationToPassenger = function (id, details) {
  const options = notification_options;

  // var message = {
  //     data: {
  //         "message":details
  //     },
  //     topic: "Trip accepted"
  // };
  var payload = {
    notification: {
      title: "Trip Cancel",
      body: details,
    },
  };

  //var pushToken = getUserToken(id);

  getUserToken(id)
    .then((val) => {
      console.log("pushToken: " + val);
      var pushToken = val;

      if (pushToken) {
        console.log(
          "sending push notification trip cancel details to passenger"
        );

        adminFcmPassenger
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {
            console.log(
              "Notification trip cancel details to passenger sent successfully"
            );
          })
          .catch((error) => {
            console.log(
              "Notification trip cancel details to passenger sent failed: " +
                error
            );
          });
      } else {
        console.log("Push token not found");
      }
    })
    .catch((err) => {
      console.log("Push token not found: " + err);
    });
};

exports.sendTripEndPushNotificationToPassenger = function (id, details) {
  const options = notification_options;

  // var message = {
  //     data: {
  //         "message":details
  //     },
  //     topic: "Trip accepted"
  // };
  var payload = {
    notification: {
      title: "Trip End",
      body: details,
    },
  };

  //var pushToken = getUserToken(id);

  getUserToken(id)
    .then((val) => {
      console.log("pushToken: " + val);
      var pushToken = val;

      if (pushToken) {
        console.log("sending push notification trip end details to passenger");

        adminFcmPassenger
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {
            console.log(
              "Notification trip end details to passenger sent successfully"
            );
          })
          .catch((error) => {
            console.log(
              "Notification trip end details to passenger sent failed: " + error
            );
          });
      } else {
        console.log("Push token not found");
      }
    })
    .catch((err) => {
      console.log("Push token not found: " + err);
    });
};

exports.sendDispatchEnabledPushNotificationToPassenger = function (
  id,
  details
) {
  const options = notification_options;

  // var message = {
  //     data: {
  //         "message":details
  //     },
  //     topic: "Trip accepted"
  // };
  var payload = {
    notification: {
      title: "Taxime Dispatch Trips",
      body: details,
    },
  };

  //var pushToken = getUserToken(id);

  getUserToken(id)
    .then((val) => {
      console.log("pushToken: " + val);
      var pushToken = val;

      if (pushToken) {
        console.log(
          "sending push notification dispatch enabled details to passenger"
        );

        adminFcmPassenger
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {
            console.log(
              "Notification dispatch enabled details to passenger sent successfully"
            );
          })
          .catch((error) => {
            console.log(
              "Notification dispatch enabled details to passenger sent failed: " +
                error
            );
          });
      } else {
        console.log("Push token not found");
      }
    })
    .catch((err) => {
      console.log("Push token not found: " + err);
    });
};
