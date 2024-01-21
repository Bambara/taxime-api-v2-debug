const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
// var mongoose = require("mongoose");
// const Passenger = require("./models/user");
const PassengerTrack = require("./models/passengertracking");
const VehicleTracking = require("./models/vehicletracking");
const Vehicle = require("./models/vehicle");
// var Driver = require("./models/driver");
// const VehicleCategory = require("./models/vehiclecategory");
const Trip = require("./models/trip");
const app = express();
const mongoose = require("mongoose");
// const config = require("./config");
const geolib = require("geolib");
// var otp = require("./services/randomnum");
const cors = require("cors");
const dbClient = require("./database_client");
const asyncHandler = require("express-async-handler");

require("dotenv").config();

const BASE_URL = process.env.BASE_URL;
const PASSENGER_PORT = process.env.PASSENGER_PORT;
const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY;

//################### geocoder settings ###################################
const NodeGeocoder = require("node-geocoder");
const chalk = require("chalk");
const PassengerNotification = require("./services/passengerNotifications");
const DriverNotifications = require("./services/driverNotifications");

const options = {
    provider: "google",

    httpAdapter: "https",
    apiKey: GOOGLE_MAP_API_KEY,
    formatter: null,
};

const geocoder = NodeGeocoder(options);

//##########################################################################

app.get("/", (req, res) => {
    res.send("Socket server");
});

app.use(cors());

const server = http.Server(app);
const portSelected = PASSENGER_PORT;

server.listen(portSelected, function () {
    console.log("TaxiMe API passenger Socket listening on port " + portSelected);
});

// const dbe = config.DB_URL_DEV;
//
// mongoose.Promise = require("bluebird");
// mongoose.set("strictQuery", false);
// mongoose.connect(dbe);

dbClient.connectDB();

const io = socketIo(server);

io.on(
    "connection",
    asyncHandler(async (socket) => {
        console.log("Passenger socket on : connection: " + socket.id);

        /* passenger connect */
        await socket.on("passengerConnected", (res) => {
            console.log("passengerConnected");
            console.log(res);

            /* remove old tracking data and save new tracking data */

            PassengerTrack.deleteOne({
                passengerId: res.passengerId,
            }).then((value) => {
                var passengertrack = new PassengerTrack();

                passengertrack.passengerId = res.passengerId;
                passengertrack.socketId = socket.id;
                passengertrack.currentLocation.address = res.address;
                passengertrack.currentLocation.longitude = res.longitude;
                passengertrack.currentLocation.latitude = res.latitude;
                passengertrack.currentStatus = res.currentStatus;

                passengertrack.save(function (err, results) {
                    if (err) {
                        console.log("inPtrackErr: " + err);
                        //io.to(socket.id).emit('passengerConnectResult', 'faild');
                    } else {
                        console.log("PtrackSave: " + results);
                        io.to(results.socketId).emit("passengerConnectResult", results);
                    }
                });
            });
            // PassengerTrack.findOneAndRemove({
            //   passengerId: res.passengerId,
            // }).exec(function (err, result) {
            //   if (err) {
            //     console.log("inPtrackErr 01: " + err);
            //   }
            //
            //   var passengertrack = new PassengerTrack();
            //
            //   passengertrack.passengerId = res.passengerId;
            //   passengertrack.socketId = socket.id;
            //   passengertrack.currentLocation.address = res.address;
            //   passengertrack.currentLocation.longitude = res.longitude;
            //   passengertrack.currentLocation.latitude = res.latitude;
            //   passengertrack.currentStatus = res.currentStatus;
            //
            //   passengertrack.save(function (err, results) {
            //     if (err) {
            //       console.log("inPtrackErr: " + err);
            //       //io.to(socket.id).emit('passengerConnectResult', 'faild');
            //     } else {
            //       console.log("PtrackSave: " + results);
            //       io.to(results.socketId).emit("passengerConnectResult", results);
            //     }
            //   });
            // });
        });

        /* passenger connect */
        await socket.on("submitLocation", (res) => {
            console.log("Submit Location");
            console.log(res);

            /* remove old tracking data and save new tracking data */
            PassengerTrack.findOne({
                passengerId: res.passengerId,
            })
                .then((updates) => {
                    if (updates) {
                        updates.passengerId = res.passengerId || updates.passengerId;
                        updates.socketId = res.socketId || updates.socketId;
                        updates.currentLocation =
                            res.currentLocation || updates.currentLocation;
                        updates.currentStatus = res.currentStatus || updates.currentStatus;

                        updates
                            .save()
                            .then((value) => {
                                io.to(updates.socketId).emit("submitLocationResult", value);
                            })
                            .catch((error) => {
                                console.error({error: error.toString()});
                            });
                    } else {
                        const passengerTrack = new PassengerTrack();

                        passengerTrack.passengerId = res.passengerId;
                        passengerTrack.socketId = res.socketId;
                        passengerTrack.currentLocation.address = res.address;
                        passengerTrack.currentLocation.longitude = res.longitude;
                        passengerTrack.currentLocation.latitude = res.latitude;
                        passengerTrack.currentStatus = res.currentStatus;

                        passengerTrack
                            .save()
                            .then((saveDoc) => {
                                console.info("Passenger Tracking : " + saveDoc);
                                io.to(saveDoc.socketId).emit("submitLocationResult", saveDoc);
                            })
                            .catch((error) => {
                                console.error({error: error.toString()});
                            });
                    }
                })
                .catch((error) => {
                    console.error({error: error.toString()});
                });
        });

        await socket.on("requestTripPayment", (req) => {
            console.log(`Request Trip Payment ${req.passengerSocket}`);
            console.log(req);
            io.to(req.passengerSocket).emit("request_trip_payment", req);
        });

        await socket.on("updatePayStatus", (req) => {
            console.info(chalk.blue("Passenger socket on : Update Pay Status"));
            console.info(chalk.blue(req.trip_id));
            console.info(chalk.blue(req.pay_method));
            console.info(chalk.blue(req.pay_status));

            const payStatus = {
                $set: {
                    payMethod: req.pay_method,
                    payStatus: req.pay_status,
                }
            };

            Trip.findOneAndUpdate({_id: req.trip_id}, payStatus, {new: true})
                .then(value => {

                    const payObject = {
                        "trip_id": req.trip_id,
                        "pay_method": value['payMethod'],
                        "pay_status": value['payStatus'],
                        'driver_socket_id': req.driver_socket_id,
                    }

                    DriverNotifications.getTripPaymentToDriver(payObject);
                }).catch(reason => {

                const payObject = {
                    "trip_id": req.trip_id,
                    "pay_method": '',
                    "pay_status": '',

                }
                DriverNotifications.getTripPaymentToDriver(payObject);
            });
        });

        /* passenger diconnect */
        await socket.on("disconnect", () => {
            console.log("Passenger socket on : disconnect");

            /* remove tracking data */
            PassengerTrack.findOneAndRemove({
                socketId: socket.id,
            }).exec(function (err, result) {
                if (err) {
                    console.log("err");
                } else {
                    console.log("passenger track deleted.");
                }
            });
        });

        /* to disconnect passenger tracking */
        await socket.on("toDisconnect", (data) => {
            console.log("Passenger socket on : toDisconnect");
            PassengerTrack.findOneAndRemove({
                $or: [
                    {
                        socketId: data.socketId,
                    },
                    {
                        passengerId: data.passengerId,
                    },
                ],
            }).exec(function (err, result) {
                if (err) {
                    console.log("err");
                } else {
                    console.log("passenger track deleted.");
                }
            });
        });

        await socket.on("recon", (data) => {
            console.log("Passenger socket on : reconnected");

            var newVals = {
                $set: {
                    socketId: socket.id,
                },
            };

            /* update tracking data */
            PassengerTrack.findOneAndUpdate(
                {
                    passengerId: data.passengerId,
                },
                newVals,
                function (err, results) {
                    if (err) {
                        console.log("err in reconnecting");
                        //io.to(socket.id).emit('reConnectResult', 'faild!');
                    } else {
                        if (results != null) {
                            console.log("reconnect success!");
                            // console.log(results);
                            io.to(socket.id).emit("reConnectResult", results);
                        } else {
                            if (data.passengerId && data.currentStatus) {
                                var passengertrack = new PassengerTrack();

                                passengertrack.passengerId = data.passengerId;
                                passengertrack.socketId = socket.id;
                                passengertrack.currentLocation.address = data.address;
                                passengertrack.currentLocation.longitude = data.longitude;
                                passengertrack.currentLocation.latitude = data.latitude;
                                passengertrack.currentStatus = data.currentStatus;

                                passengertrack.save(function (err, results) {
                                    if (err) {
                                        console.log("inPtrackErr: " + err);
                                    } else {
                                        console.log("PassengertrackSave");
                                        io.to(results.socketId).emit(
                                            "passengerConnectResult",
                                            results
                                        );
                                    }
                                });
                            } else {
                                console.log("inside else");
                                io.to(socket.id).emit("reConnectResult", results);
                            }
                        }
                    }
                }
            );
        });

        await socket.on("getOnlineDriversBylocation", (data1) => {
            // console.log("Passenger socket on : getOnlineDriversBylocation");

            VehicleTracking.find({
                currentStatus: "online",
            }).then(value => {
                if (value.length === 0) {
                    // console.log(chalk.yellow("####################### No online Drivers ##########################"));
                } else {
                    // console.log(chalk.green(value));

                    var tempDrivers = [];
                    if (value.radius) {
                        var radius = parseInt(data1.radius * 1000);
                    } else {
                        var radius = 5000;
                    }

                    value.forEach(function (element) {
                        if (
                            geolib.isPointInCircle(
                                {
                                    latitude: element.currentLocation.latitude,
                                    longitude: element.currentLocation.longitude,
                                },
                                {
                                    latitude: data1.latitude,
                                    longitude: data1.longitude,
                                },
                                radius
                            )
                        ) {
                            tempDrivers.push(element);
                        }
                    });

                    let resp = [];

                    tempDrivers.forEach((el, i) => {
                        resp.push({
                            currentLocation: {
                                address: el.currentLocation.address,
                                latitude: el.currentLocation.latitude,
                                longitude: el.currentLocation.longitude,
                            },
                            currentStatus: el.currentStatus,
                            driverId: el.driverId,
                            driverInfo: el.driverInfo,
                            vehicleCategory: el.vehicleCategory,
                            vehicleCategoryData: el.vehicleCategoryData,
                            vehicleInfo: el.vehicleInfo,
                            vehicleSubCategory: el.vehicleSubCategory,
                        });
                        /* resp.push({
                          currentLocation: {
                            address: el.currentLocation.address,
                            latitude: 2 * data1.latitude - el.currentLocation.latitude,
                            longitude:
                              i % 2 == 0
                                ? data1.longitude + ((0.001 * (5 + i)) % 8)
                                : data1.longitude + ((0.002 * (7 + i)) % 8),
                          },
                          currentStatus: el.currentStatus,
                          driverId: el.driverId + i + "-1",
                          driverInfo: el.driverInfo,
                          vehicleCategory: el.vehicleCategory,
                          vehicleCategoryData: el.vehicleCategoryData,
                          vehicleInfo: el.vehicleInfo,
                          vehicleSubCategory: el.vehicleSubCategory,
                        }); */
                        /* resp.push({
                          currentLocation: {
                            address: el.currentLocation.address,
                            latitude:
                              i % 2 == 0
                                ? data1.latitude + ((0.001 * (6 + i)) % 8)
                                : data1.latitude + ((0.002 * (5 + i)) % 8),
                            longitude:
                              i % 2 == 0
                                ? data1.longitude + ((0.002 * (7 + i)) % 9)
                                : data1.longitude + ((0.001 * (4 + i)) % 9),
                          },
                          currentStatus: el.currentStatus,
                          driverId: el.driverId + i + "-2",
                          driverInfo: el.driverInfo,
                          vehicleCategory: el.vehicleCategory,
                          vehicleCategoryData: el.vehicleCategoryData,
                          vehicleInfo: el.vehicleInfo,
                          vehicleSubCategory: el.vehicleSubCategory,
                        }); */
                        // resp.push({
                        //     currentLocation: {
                        //         address : el.currentLocation.address,
                        //         latitude : (i % 2 == 0) ? el.currentLocation.latitude + (0.001 * (6 + i) % 9) : el.currentLocation.latitude + (0.001 * (3 + i) % 9),
                        //         longitude : (i % 2 == 0) ? el.currentLocation.longitude + (0.001 * (4 + i) % 8) : el.currentLocation.longitude + (0.001 * (6 + i) % 8),
                        //     },
                        //     currentStatus: el.currentStatus,
                        //     driverId: el.driverId + i + '-3',
                        //     driverInfo: el.driverInfo,
                        //     vehicleCategory: el.vehicleCategory,
                        //     vehicleCategoryData: el.vehicleCategoryData,
                        //     vehicleInfo: el.vehicleInfo,
                        //     vehicleSubCategory: el.vehicleSubCategory
                        // });
                    });

                    io.to(data1.socketId).emit("allOnlineDriversResult", resp);
                }
            }).catch(reason => {
                console.log(chalk.red(reason));
            });
            /*.exec(function (err, data) {
            if (err) {
                console.log("ERRR");
            } else {
                if (data.length === 0) {
                    console.log(
                        "####################### No online Drivers ##########################"
                    );
                } else {
                    //   console.log(data)

                }
            }
        });*/
        });

        await socket.on("TripDetails", (data) => {
            console.log("Passenger socket on : TripDetails");
            io.to(data.socketId).volatile.emit("driverDetails", data);
        });

        await socket.on("getDriverLocationById", (data) => {
            // console.log("Passenger socket on : getDriverLocationById");
            /* finder driver by driver id */
            VehicleTracking.findOne({
                driverId: data.driverId,
            }).exec(function (err, driverTrack) {
                if (err) {
                    console.log("####Error in vehicle tracking");
                } else {
                    if (driverTrack == null) {
                        console.log();
                    } else {
                        // console.log(driverTrack)
                        io.to(data.socketId).emit(
                            "getDriverLocationByIdResult",
                            driverTrack
                        );

                        if (data.tripId) {
                            Trip.findById(
                                mongoose.Types.ObjectId(data.tripId),
                                function (err, tripData) {

                                    io.to(data.socketId).emit("tripEndDetails", tripData);

                                    if (tripData.status === "canceled") {
                                        var passengerSocketObj = {
                                            socketId: data.socketId,
                                            canceledDriverId: tripData.cancelDetails[0].canceledDriverId,
                                            cancelReason: tripData.cancelDetails[0].cancelReason
                                        };
                                        io.to(data.socketId).emit("tripCancelByDriver", passengerSocketObj);
                                    }
                                }
                            );
                        }
                    }
                }
            });
        });

        await socket.on("TripCancel", (data) => {
            console.log("Passenger socket on : TripCancel");
            console.log(data);
            io.to(data.socketId).emit("tripCancelByDriver", data);
        });

        await socket.on("EndTrip", (data) => {
            console.log("Passenger socket on : EndTrip");
            console.log(data);
            io.to(data.socketId).emit("tripEndByDriver", data);
        });

        await socket.on("getTripAcceptDetails", (data) => {
            // console.log("Passenger socket on : getTripAcceptDetails");
            //req.body.tripId
            //req.body.socketId
            Trip.findById(
                mongoose.Types.ObjectId(data.tripId),
                function (err, tripData) {
                    if (err) {
                        console.log(
                            "################### error finding trip ####################"
                        );
                    } else {
                        if (
                            tripData.status == "accepted" &&
                            tripData.assignedDriverId != null
                        ) {
                            VehicleTracking.findOne(
                                {
                                    driverId: tripData.assignedDriverId,
                                },
                                function (err1, driverData) {
                                    if (err1) {
                                        console.log(
                                            "################### error finding driver ####################"
                                        );
                                    } else {
                                        Vehicle.findById(
                                            tripData.assignedVehicleId,
                                            function (err2, vehicleData) {
                                                if (err2) {
                                                    console.log(
                                                        "################### error finding vehicle ####################"
                                                    );
                                                } else {
                                                    if (data.socketId) {
                                                        var tripDetailsObj = {
                                                            tripId: tripData._id,
                                                            driverId: driverData.driverId,
                                                            driverName: driverData.driverInfo.driverName,
                                                            driverContactNo:
                                                            driverData.driverInfo.driverContactNumber,
                                                            driverPic: driverData.driverPic,
                                                            vehicleId: vehicleData._id,
                                                            vehicleRegistrationNo:
                                                            vehicleData.vehicleRegistrationNo,
                                                            vehicleBrand: vehicleData.vehicleBrandName,
                                                            vehicleModel: vehicleData.vehicleModel,
                                                            vehicleColor: vehicleData.vehicleColor,
                                                            longitude: driverData.currentLocation.longitude,
                                                            latitude: driverData.currentLocation.latitude,
                                                            socketId: data.socketId,
                                                        };

                                                        io.to(data.socketId).volatile.emit(
                                                            "driverDetails",
                                                            tripDetailsObj
                                                        );
                                                    }
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                }
            );
        });

        await socket.on("getTripEndtDetails", (data) => {
            console.log("Passenger socket on : getTripEndtDetails");
            //req.body.tripId
            //req.body.socketId
            Trip.findById(
                mongoose.Types.ObjectId(data.tripId),
                function (err, tripData) {
                    if (err) {
                        console.log(
                            "################### error finding trip ####################"
                        );
                    } else {
                        if (
                            tripData.status === "done" &&
                            tripData.assignedDriverId != null
                        ) {
                            if (data.socketId) {
                                var passengerSocketObj = {
                                    distance: tripData.distance,
                                    totalPrice: tripData.totalPrice,
                                    waitTime: tripData.waitTime,
                                    waitingCost: tripData.waitingCost,
                                    discount: 0,
                                    dropDateTime: tripData.dropDateTime,
                                    tripTime: tripData.tripTime,
                                    socketId: data.socketId,
                                };
                                io.to(data.socketId).volatile.emit(
                                    "tripEndByDriver",
                                    passengerSocketObj
                                );
                            }
                        }
                    }
                }
            );
        });
    })
);
