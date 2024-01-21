"use strict";

const express = require("express");
// var router = express.Router();
// var app = express();
// var bodyParser = require("body-parser");
// var cors = require("cors");
// var config = require("../config");
const Driver = require("../models/driver");
// var User = require("../models/user");
// var socket = require("socket.io-client")(
//   config.BASE_URL.concat(config.DRIVER_PORT)
// );

/* author : ghost */
const adminFcmDriver = require("firebase-admin");
const serviceAccount = require("../driverServiceAccount.json");

adminFcmDriver.initializeApp(
  {
    credential: adminFcmDriver.credential.cert(serviceAccount),
    databaseURL: "https://taxime-driver-new-a8ab6.firebaseio.com",
  },
  "secondary"
);

const notification_options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
};

function getDriverToken(id) {
  return new Promise((resolve, reject) => {
    Driver.findOne({
      _id: id,
    }).exec(function (err, driver) {
      if (err) {
        console.log(err);
        resolve(false);
      } else {
        if (driver == null) {
          console.log(
            "####################### Cannot find user ##########################"
          );

          resolve(false);
        } else {
          //console.log("driver.pushToken : "+driver.pushToken);
          if (driver.pushToken && driver.pushToken != null) {
            //console.log("driver.pushToken1 : "+driver.pushToken);
            //return user.pushToken;
            resolve(driver.pushToken);
          }
          resolve(false);
        }
      }
    });
  });
}

// exports.driverRegToAdmin = function (req) {
//     console.log('notify')
//     socket.emit('newDriver', req);
// };

// exports.driverStatus = function (req) {
//     console.log('driver state')
//     socket.emit('driverConnect', req);
// };

exports.sendLiveTripPushNotificationToDriver = function (id, details) {
  const options = notification_options;

  var payload = {
    notification: {
      title: "Trip Accepted",
      body: details,
    },
  };

  getDriverToken(id)
    .then((val) => {
      console.log("pushToken: " + val);
      var pushToken = val;

      if (pushToken) {
        console.log("sending live trip push notification to driver");

        adminFcmDriver
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {
            console.log("Notification live trip to driver sent successfully");
          })
          .catch((error) => {
            console.log(
              "Notification live trip to driver sent failed: " + error
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

exports.sendDispatchPushNotificationToDriver = function (id, details) {
  const options = notification_options;

  var payload = {
    notification: {
      title: "New Booking",
      body: details,
    },
  };

  getDriverToken(id)
    .then((val) => {
      console.log("pushToken: " + val);
      var pushToken = val;

      if (pushToken) {
        console.log("sending dispatch trip push notification to driver");

        adminFcmDriver
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {
            console.log(
              "Notification dispatch trip to driver sent successfully"
            );
          })
          .catch((error) => {
            console.log(
              "Notification dispatch trip to driver sent failed: " + error
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

exports.removeDispatchPushNotificationToDriver = function (id, details) {
  const options = notification_options;

  var payload = {
    notification: {
      title: "Trip Accepted",
      body: details,
    },
  };

  getDriverToken(id)
    .then((val) => {
      console.log("pushToken: " + val);
      var pushToken = val;

      if (pushToken) {
        console.log("sending dispatch trip remove push notification to driver");

        adminFcmDriver
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {
            console.log(
              "Notification dispatch trip remove to driver sent successfully"
            );
          })
          .catch((error) => {
            console.log(
              "Notification dispatch trip remove to driver sent failed: " +
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

exports.removeLiveTripPushNotificationToDriver = function (id, details) {
  const options = notification_options;

  var payload = {
    notification: {
      title: "Trip Accepted",
      body: details,
    },
  };

  getDriverToken(id)
    .then((val) => {
      console.log("pushToken: " + val);
      var pushToken = val;

      if (pushToken) {
        console.log("sending live trip remove push notification to driver");

        adminFcmDriver
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {
            console.log(
              "Notification live trip remove to driver sent successfully"
            );
          })
          .catch((error) => {
            console.log(
              "Notification live trip remove to driver sent failed: " + error
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

exports.sendLiveTripCancelPushNotificationToDriver = function (id, details) {
  const options = notification_options;

  var payload = {
    notification: {
      title: "Trip Canceled",
      body: details,
    },
  };

  getDriverToken(id)
    .then((val) => {
      console.log("pushToken: " + val);
      var pushToken = val;

      if (pushToken) {
        console.log("sending live trip cancel push notification to driver");

        adminFcmDriver
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {
            console.log(
              "Notification live trip cancel to driver sent successfully"
            );
          })
          .catch((error) => {
            console.log(
              "Notification live trip cancel to driver sent failed: " + error
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

exports.sendDispatchEnabledPushNotificationToDriver = function (id, details) {
  const options = notification_options;

  var payload = {
    notification: {
      title: "Taxime Dispatch Trips",
      body: details,
    },
  };

  getDriverToken(id)
    .then((val) => {
      console.log("pushToken: " + val);
      var pushToken = val;

      if (pushToken) {
        console.log(
          "sending push notification dispatch enabled details to driver"
        );

        adminFcmDriver
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {
            console.log(
              "Notification dispatch enabled details to driver sent successfully"
            );
          })
          .catch((error) => {
            console.log(
              "Notification dispatch enabled details to driver sent failed: " +
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

/* any push notification for driver */
exports.sendPushNotificationToDriver = function (id, title, details) {
  const options = notification_options;

  var payload = {
    notification: {
      title: title,
      body: details,
    },
  };

  getDriverToken(id)
    .then((val) => {
      var pushToken = val;

      if (pushToken) {
        adminFcmDriver
          .messaging()
          .sendToDevice(pushToken, payload, options)
          .then((response) => {})
          .catch((error) => {});
      } else {
        console.log("Push token not found");
      }
    })
    .catch((err) => {
      console.log("Push token not found: " + err);
    });
};
