const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
// var notificationStats = require('./services/notificationstats');
// const Driver = require("./models/driver");
const VehicleTrack = require("./models/vehicletracking");
const PassengerTrack = require("./models/passengertracking");
const PassengerNotification = require("./services/passengerNotifications");
const Trip = require("./models/trip");
// const VehicleCategory = require("./models/vehiclecategory");
const app = express();
// const mongoose = require("mongoose");
// const config = require("./config");
// const notification = require("./services/adminNotifications");
const chalk = require("chalk");
require("dotenv").config();

const BASE_URL = process.env.BASE_URL;
const DRIVER_PORT = process.env.DRIVER_PORT;
const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY;

app.get("/", (req, res) => {
    res.send("Socket server");
});

const cors = require("cors");
const asyncHandler = require("express-async-handler");
const dbClient = require("./database_client");
app.use(cors());

const server = http.Server(app);
// const DRIVER_PORT = DRIVER_PORT;

server.listen(DRIVER_PORT, function () {
    console.info(
        chalk.blue("TaxiMe API driver Socket listening on port " + DRIVER_PORT)
    );
});

//Connect to MongoDB
// const dbe = DB_URL_DEV;
// mongoose.Promise = require("bluebird");
// mongoose.set("strictQuery", false);
// mongoose.connect(dbe);

dbClient.connectDB();

const io = socketIo(server);

io.on(
    "connection",
    asyncHandler(async (socket) => {
        console.info(chalk.green("Driver socket on : connection: " + socket.id));

        await socket.on("driverConnected", (res) => {
            console.info(chalk.green("driverConnected"));
            console.info(chalk.green(res));
            // var driVals = {
            //     $set: {
            //         vehicleId : res.vehicleId,
            //         driverId : res.driverId,
            //         socketId : socket.id,
            //         'currentLocation.address' : res.address,
            //         'currentLocation.latitude' : res.latitude,
            //         'currentLocation.longitude' : res.longitude,
            //         vehicleCategory : res.vehicleCategory,
            //         vehicleSubCategory : res.vehicleSubCategory,
            //         operationRadius : res.operationRadius,
            //         'driverInfo.driverName' : res.driverName,
            //         'driverInfo.driverContactNumber' : res.driverContactNumber,
            //         'vehicleInfo.vehicleRegistrationNo' : res.vehicleRegistrationNo,
            //         'vehicleInfo.vehicleLicenceNo' : res.vehicleLicenceNo,
            //         currentStatus : res.currentStatus
            //     }
            // }

            // VehicleTrack.findOneAndUpdate({
            //     driverId: res.driverId
            // }, driVals, function (error, driverTrack) {
            //     if (driverTrack != null) {
            //         io.to(socket.id).emit('driverConnectResult', driverTrack);
            //     } else {

            VehicleTrack.findOneAndRemove({
                driverId: res.driverId,
            }).exec(function (err, result) {
                var vehicletrack = new VehicleTrack();

                vehicletrack.vehicleId = res.vehicleId;
                vehicletrack.driverId = res.driverId;
                vehicletrack.socketId = socket.id;

                vehicletrack.currentLocation.address = res.address;
                vehicletrack.currentLocation.latitude = res.latitude;
                vehicletrack.currentLocation.longitude = res.longitude;

                vehicletrack.vehicleCategory = res.vehicleCategory;
                vehicletrack.vehicleSubCategory = res.vehicleSubCategory;
                vehicletrack.operationRadius = res.operationRadius;

                vehicletrack.driverInfo.driverName = res.driverName;
                vehicletrack.driverInfo.driverContactNumber = res.driverContactNumber;

                vehicletrack.vehicleInfo.vehicleRegistrationNo =
                    res.vehicleRegistrationNo;
                vehicletrack.vehicleInfo.vehicleLicenceNo = res.vehicleLicenceNo;

                vehicletrack.currentStatus = res.currentStatus;
                // vehicletrack.bidValue = res.bidValue;
                vehicletrack.driverPic = res.driverPic;
                vehicletrack.subCategoryIcon = res.subCategoryIcon;
                vehicletrack.subCategoryIconSelected = res.subCategoryIconSelected;
                vehicletrack.mapIcon = res.mapIcon;
                vehicletrack.mapIconOffline = res.mapIconOffline;
                vehicletrack.mapIconOntrip = res.mapIconOntrip;
                vehicletrack.subCategoryIconSVG = res.subCategoryIconSVG;
                vehicletrack.subCategoryIconSelectedSVG =
                    res.subCategoryIconSelectedSVG;
                vehicletrack.mapIconSVG = res.mapIconSVG;
                vehicletrack.mapIconOfflineSVG = res.mapIconOfflineSVG;
                vehicletrack.mapIconOntripSVG = res.mapIconOntripSVG;

                // if(res.vehicleColor && res.vehicleBrand && res.totalWalletPoints) {
                //     vehicletrack.vehicleInfo.vehicleColor = res.vehicleColor;
                //     vehicletrack.vehicleInfo.vehicleBrand = res.vehicleBrand;
                //     vehicletrack.totalWalletPoints = res.totalWalletPoints;
                // }

                vehicletrack.save(function (err, results) {
                    if (err) {
                        console.error(chalk.red("inVtrackErr: " + err));
                        //io.to(socket.id).emit('driverConnectResult', 'faild!');
                    } else {
                        console.info(chalk.blue("VtrackSave: " + results));
                        io.to(results.socketId).emit("driverConnectResult", results);
                    }
                });
            });

            /// }
            //})
        });

        await socket.on("updateCurrentStatus", (res) => {
            console.info(chalk.blue("Driver socket on : updateCurrentStatus"));

            var newVals = {
                $set: {
                    currentStatus: res.currentStatus,
                },
            };

            VehicleTrack.findOneAndUpdate(
                {
                    socketId: res.to,
                },
                newVals,
                function (err, result) {
                    if (err) {
                        console.error(chalk.blue("stateUpdateErr: " + err));
                        io.to(res.to).emit("currentStateUpdate", "failed");
                    } else {
                        // console.log('stateUpdateRes: ' + result)
                        io.to(res.to).emit("currentStateUpdate", result);
                    }
                }
            );
        });

        await socket.on("updatePayStatus", (req) => {
            console.info(chalk.blue("Driver socket on : Update Pay Status"));
            console.info(chalk.blue(req.trip_type));
            console.info(chalk.blue(req.pay_status));

            const payStatus = {
                $set: {
                    payStatus: req.pay_status,
                },
            };

            if (req.trip_type === "TRIP") {
                Trip.findOneAndUpdate({_id: req.passengerTripEndRequestModel.trip_id}, payStatus)
                    .then(value => {

                        PassengerTrack.findOne({passengerId: req.passenger_id}).then(pTrack => {
                            const result = {
                                'trip': req,
                                'driverSocket': req.driver_socket_id,
                                'passengerSocket': pTrack.socketId
                            }

                            PassengerNotification.sendTripPaymentToPassenger(result);
                        }).catch(reason => {

                        })
                    }).catch(reason => {
                    const result = {
                        'trip': req,
                        'driverSocket': req.driverSocketId,
                        'passangerSocket': req.driverSocketId
                    }
                    PassengerNotification.sendTripPaymentToPassenger(result);
                });
            }else if (req.trip_type === "DISPATCH_TRIP") {

            }
        });

        await socket.on("getTripPaymentStatus", (req) => {
            console.info(chalk.blue("Driver socket on : Get Trip Payment Status"));
            console.info(chalk.blue(req.trip_id));
            console.info(chalk.blue(req.pay_status));

            io.to(req.driver_socket_id).emit("get_trip_payment_status", req);

            /*const payStatus = {
                $set: {
                    payStatus: req.pay_status,
                },
            };

            Trip.findOneAndUpdate({_id: req.trip_id}, payStatus)
                .then(value => {
                    // PassengerNotification.sendTripPaymentToPassenger(value);
                }).catch(reason => {
                // PassengerNotification.sendTripPaymentToPassenger(reason);
            });*/
        });

        await socket.on("submitLocation", (res) => {
            // console.info(chalk.blue("Driver socket on : submitLocation"));

            if (res.driverId && res.vehicleId) {
                if (res.address != null) {
                    const newValues = {
                        $set: {
                            "currentLocation.longitude": res.longitude,
                            "currentLocation.latitude": res.latitude,
                            "currentLocation.address": res.address,
                            currentStatus: res.currentStatus,
                            //bidValue : res.bidValue,
                            driverPic: res.driverPic,
                            subCategoryIcon: res.subCategoryIcon,
                            subCategoryIconSelected: res.subCategoryIconSelected,
                            mapIcon: res.mapIcon,
                            mapIconOffline: res.mapIconOffline,
                            mapIconOntrip: res.mapIconOntrip,
                            subCategoryIconSVG: res.subCategoryIconSVG,
                            subCategoryIconSelectedSVG: res.subCategoryIconSelectedSVG,
                            mapIconSVG: res.mapIconSVG,
                            mapIconOfflineSVG: res.mapIconOfflineSVG,
                            mapIconOntripSVG: res.mapIconOntripSVG,
                        },
                    };
                    VehicleTrack.findOneAndUpdate(
                        {
                            $or: [
                                {
                                    socketId: res.to,
                                },
                                {
                                    driverId: res.driverId,
                                },
                            ],
                        },
                        newValues,
                        function (err, result) {
                            if (err) {
                                console.error("locationUErr: " + err);
                                //io.to(res.to).emit('gotLocation', 'fail');
                            } else {
                                if (result == null && res.to != null) {
                                    var vehicletrack = new VehicleTrack();

                                    vehicletrack.vehicleId = res.vehicleId;
                                    vehicletrack.driverId = res.driverId;
                                    vehicletrack.socketId = res.to;

                                    vehicletrack.currentLocation.address = res.address;
                                    vehicletrack.currentLocation.latitude = res.latitude;
                                    vehicletrack.currentLocation.longitude = res.longitude;

                                    vehicletrack.vehicleCategory = res.vehicleCategory;
                                    vehicletrack.vehicleSubCategory = res.vehicleSubCategory;
                                    vehicletrack.operationRadius = res.operationRadius;

                                    vehicletrack.driverInfo.driverName = res.driverName;
                                    vehicletrack.driverInfo.driverContactNumber =
                                        res.driverContactNumber;

                                    vehicletrack.vehicleInfo.vehicleRegistrationNo =
                                        res.vehicleRegistrationNo;
                                    vehicletrack.vehicleInfo.vehicleLicenceNo =
                                        res.vehicleLicenceNo;
                                    vehicletrack.currentStatus = res.currentStatus;
                                    // vehicletrack.bidValue = res.bidValue;
                                    vehicletrack.driverPic = res.driverPic;
                                    vehicletrack.subCategoryIcon = res.subCategoryIcon;
                                    vehicletrack.subCategoryIconSelected =
                                        res.subCategoryIconSelected;
                                    vehicletrack.mapIcon = res.mapIcon;
                                    vehicletrack.mapIconOffline = res.mapIconOffline;
                                    vehicletrack.mapIconOntrip = res.mapIconOntrip;
                                    vehicletrack.subCategoryIconSVG = res.subCategoryIconSVG;
                                    vehicletrack.subCategoryIconSelectedSVG =
                                        res.subCategoryIconSelectedSVG;
                                    vehicletrack.mapIconSVG = res.mapIconSVG;
                                    vehicletrack.mapIconOfflineSVG = res.mapIconOfflineSVG;
                                    vehicletrack.mapIconOntripSVG = res.mapIconOntripSVG;

                                    vehicletrack.save(function (err, results) {
                                        if (err) {
                                            console.error(chalk.red("inVtrackErr: " + err));
                                            //io.to(socket.id).emit('driverConnectResult', 'faild!');
                                        } else {
                                            // console.log('VtrackSaveInlocation: ' + results)
                                            io.to(results.socketId).emit(
                                                "driverConnectResult",
                                                results
                                            );
                                        }
                                    });
                                } else {
                                    // console.info(chalk.blue("location not updated"));
                                    // console.log(result)
                                }
                            }
                        }
                    );
                }
            } else {
                if (res.address != null) {
                    var newValues = {
                        $set: {
                            "currentLocation.longitude": res.longitude,
                            "currentLocation.latitude": res.latitude,
                            "currentLocation.address": res.address,
                        },
                    };
                    VehicleTrack.findOneAndUpdate(
                        {
                            $or: [
                                {
                                    socketId: res.to,
                                },
                                {
                                    driverId: res.driverId,
                                },
                            ],
                        },
                        newValues,
                        function (err, result) {
                            if (err) {
                                console.error(chalk.red("locationUErr: " + err));
                                //io.to(res.to).emit('gotLocation', 'fail');
                            } else {
                                //io.to(res.to).emit('gotLocation', result);
                            }
                        }
                    );
                }
            }
        });

        await socket.on("DispatchTrip", (data) => {
            console.info(chalk.blue("Driver socket on : DispatchTrip"));
            console.info(chalk.blue(data.trip));
            io.to(data.socketId).emit("dispatch", data.trip);
        });

        await socket.on("PassengerTrip", (data) => {
            console.info(chalk.blue("Driver socket on : PassengerTrip"));
            // console.log(data.trip)
            io.to(data.socketId).emit("passengertrip", data.trip);
        });

        await socket.on("RemoveTrip", (data) => {
            console.info(chalk.blue("Driver socket on : RemoveTrip"));
            console.info(chalk.blue(data.trip));
            io.to(data.socketId).emit("removeDispatch", data.trip);
        });

        await socket.on("PassengerCancelTrip", (data) => {
            console.info(chalk.blue("Driver socket on : PassengerCancelTrip"));
            console.info(chalk.blue(data));
            io.to(data.socketId).emit("passengercanceltrip", data);
        });

        await socket.on("disconnect", () => {
            console.info(chalk.blue("Driver socket on : disconnect"));
            VehicleTrack.findOneAndRemove({
                socketId: socket.id,
            }).exec(function (err, result) {
                if (err) {
                    console.error(chalk.red(err.toString()));
                } else {
                    // console.log('vehicle track deleted.')
                }
            });
        });

        await socket.on("toDisconnect", (data) => {
            console.info(chalk.blue("Driver socket on : toDisconnect"));
            VehicleTrack.findOneAndRemove({
                $or: [
                    {
                        socketId: data.socketId,
                    },
                    {
                        driverId: data.driverId,
                    },
                ],
            }).exec(function (err, result) {
                if (err) {
                    console.error(chalk.blue(err.toString()));
                } else {
                    console.info(chalk.blue("vehicle track deleted."));
                }
            });
        });

        await socket.on("recon", (data) => {
            console.info(chalk.blue("Driver socket on : recon"));
            const newVals = {
                $set: {
                    socketId: socket.id,
                },
            };

            VehicleTrack.findOneAndUpdate(
                {
                    driverId: data.driverId,
                },
                newVals,
                function (err, results) {
                    if (err) {
                        console.error(chalk.red(err.toString()));
                        //io.to(socket.id).emit('reConnectResult', 'faild!');
                    } else {
                        if (results != null) {
                            console.log("reconnect success!");
                            // console.log(results);
                            io.to(socket.id).emit("reConnectResult", results);
                        } else {
                            if (data.vehicleId && data.driverName) {
                                // console.log('reconnect success!')
                                //console.log(results);
                                //console.log(socket.id)
                                //console.log(data)
                                if (data.address != null) {
                                    var vehicletrack = new VehicleTrack();

                                    vehicletrack.vehicleId = data.vehicleId;
                                    vehicletrack.driverId = data.driverId;
                                    vehicletrack.socketId = socket.id;

                                    vehicletrack.currentLocation.address = data.address;
                                    vehicletrack.currentLocation.latitude = data.latitude;
                                    vehicletrack.currentLocation.longitude = data.longitude;

                                    vehicletrack.vehicleCategory = data.vehicleCategory;
                                    vehicletrack.vehicleSubCategory = data.vehicleSubCategory;
                                    vehicletrack.operationRadius = data.operationRadius;

                                    vehicletrack.driverInfo.driverName = data.driverName;
                                    vehicletrack.driverInfo.driverContactNumber =
                                        data.driverContactNumber;

                                    vehicletrack.vehicleInfo.vehicleRegistrationNo =
                                        data.vehicleRegistrationNo;
                                    vehicletrack.vehicleInfo.vehicleLicenceNo =
                                        data.vehicleLicenceNo;
                                    vehicletrack.currentStatus = data.currentStatus;
                                    // vehicletrack.bidValue = data.bidValue;

                                    vehicletrack.driverPic = data.driverPic;
                                    vehicletrack.subCategoryIcon = data.subCategoryIcon;
                                    vehicletrack.subCategoryIconSelected =
                                        data.subCategoryIconSelected;
                                    vehicletrack.mapIcon = data.mapIcon;
                                    vehicletrack.mapIconOffline = data.mapIconOffline;
                                    vehicletrack.mapIconOntrip = data.mapIconOntrip;
                                    vehicletrack.subCategoryIconSVG = data.subCategoryIconSVG;
                                    vehicletrack.subCategoryIconSelectedSVG =
                                        data.subCategoryIconSelectedSVG;
                                    vehicletrack.mapIconSVG = data.mapIconSVG;
                                    vehicletrack.mapIconOfflineSVG = data.mapIconOfflineSVG;
                                    vehicletrack.mapIconOntripSVG = data.mapIconOntripSVG;

                                    vehicletrack.save(function (error1, results1) {
                                        if (err) {
                                            console.error(chalk.red("inVtrackErr: " + error1));
                                            io.to(socket.id).emit("driverConnectResult", "faild!");
                                        } else {
                                            if (results1 != null) {
                                                console.info(chalk.blue("vtrack:"));
                                                //console.log(results1)
                                                io.to(results1.socketId).emit(
                                                    "driverConnectResult",
                                                    results1
                                                );
                                            }
                                        }
                                    });
                                }
                                // io.to(socket.id).emit('reConnectResult', results);
                            } else {
                                //console.log('inside else');
                                io.to(socket.id).emit("reConnectResult", results);
                            }
                        }
                    }
                }
            );
        });
    })
);
