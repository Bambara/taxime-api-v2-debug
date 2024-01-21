const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
// var notificationStats = require('./services/notificationstats');
const Driver = require("./models/driver");
const VehicleTracking = require("./models/vehicletracking");
const app = express();
// const mongoose = require("mongoose");
// const config = require("./config");
const Dispatch = require("./models/dispatch");
const Trip = require("./models/trip");
// var otp = require("./services/randomnum");

require("dotenv").config();

const BASE_URL = process.env.BASE_URL;
const ADMIN_PORT = process.env.ADMIN_PORT;
const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY;

app.get("/", (req, res) => {
  res.send("Socket server");
});

const cors = require("cors");
const dbClient = require("./database_client");
const asyncHandler = require("express-async-handler");
app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const server = http.Server(app);
// const portSelected = ADMIN_PORT;

server.listen(ADMIN_PORT, function () {
  console.log(
    "TaxiMe API Admin Socket Server listening on port: " + ADMIN_PORT
  );
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
    await socket.on("adminConnected", async (res) => {
      Driver.aggregate([
        { $match: { isApproved: false } },
        { $group: { _id: "$_id" } },
      ]).exec(function (err, drivers) {
        if (err) {
          console.log("####### error occured #######" + err);
          res = err;
        } else {
          if (drivers !== null) {
            socket.emit("toEnableDriversCount", drivers);
            res = drivers;
          } else {
            res = 0;
          }
        }
      });
    });

    await socket.on("newDriver", (data) => {
      socket.broadcast.emit("toClient", {
        newDriver: data,
      });
    });

    await socket.on("getOnlineDriversBylocation", (data1) => {
      VehicleTracking.aggregate([
        {
          $lookup: {
            from: "vehiclecategories",
            localField: "vehicleCategory",
            foreignField: "categoryName",
            as: "vehicleCategoryData",
          },
        },
        {
          $unwind: "$vehicleCategoryData",
        },
        // { "$match": { "vehicleCategory.subCategory.subCategoryName": "test1" } },
        {
          $project: {
            _id: 1,
            currentStatus: 1,
            vehicleSubCategory: 1,
            vehicleCategory: 1,
            driverId: 1,
            currentLocation: 1,
            driverInfo: 1,
            vehicleInfo: 1,
            "vehicleCategoryData.subCategory": {
              $filter: {
                input: "$vehicleCategoryData.subCategory",
                as: "subCat",
                cond: {
                  $eq: ["$$subCat.subCategoryName", "$vehicleSubCategory"],
                },
              },
            },
          },
        },
      ]).exec(function (err, data) {
        if (err) {
          console.log("ERRR");
        } else {
          if (data == null || data.length === 0) {
            console.log(
              "####################### No online Drivers ##########################"
            );
          } else {
            let resp = [];
            /*
                                                                                                      data.forEach((el,i) => {
                                                                                                          resp.push({
                                                                                                              currentLocation: {
                                                                                                                  address : el.currentLocation.address,
                                                                                                                  latitude : el.currentLocation.latitude,
                                                                                                                  longitude : el.currentLocation.longitude,
                                                                                                              },
                                                                                                              currentStatus: el.currentStatus,
                                                                                                              driverId: el.driverId,
                                                                                                              driverInfo: el.driverInfo,
                                                                                                              vehicleCategory: el.vehicleCategory,
                                                                                                              vehicleCategoryData: el.vehicleCategoryData,
                                                                                                              vehicleInfo: el.vehicleInfo,
                                                                                                              vehicleSubCategory: el.vehicleSubCategory
                                                                                                          });
                                                                                                          resp.push({
                                                                                                              currentLocation: {
                                                                                                                  address : el.currentLocation.address,
                                                                                                                  latitude : el.currentLocation.latitude + (0.001 * otp.rndNo()),
                                                                                                                  longitude : el.currentLocation.longitude + (0.001 * otp.rndNo()),
                                                                                                              },
                                                                                                              currentStatus: el.currentStatus,
                                                                                                              driverId: el.driverId + i + '-1',
                                                                                                              driverInfo: el.driverInfo,
                                                                                                              vehicleCategory: el.vehicleCategory,
                                                                                                              vehicleCategoryData: el.vehicleCategoryData,
                                                                                                              vehicleInfo: el.vehicleInfo,
                                                                                                              vehicleSubCategory: el.vehicleSubCategory
                                                                                                          });
                                                                                                          resp.push({
                                                                                                              currentLocation: {
                                                                                                                  address : el.currentLocation.address,
                                                                                                                  latitude : el.currentLocation.latitude - (0.001 * otp.rndNo()),
                                                                                                                  longitude : el.currentLocation.longitude - (0.001 * otp.rndNo()),
                                                                                                              },
                                                                                                              currentStatus: el.currentStatus,
                                                                                                              driverId: el.driverId + i + '-2',
                                                                                                              driverInfo: el.driverInfo,
                                                                                                              vehicleCategory: el.vehicleCategory,
                                                                                                              vehicleCategoryData: el.vehicleCategoryData,
                                                                                                              vehicleInfo: el.vehicleInfo,
                                                                                                              vehicleSubCategory: el.vehicleSubCategory
                                                                                                          });
                                                                                                          resp.push({
                                                                                                              currentLocation: {
                                                                                                                  address : el.currentLocation.address,
                                                                                                                  latitude : el.currentLocation.latitude - (0.001 * otp.rndNo()),
                                                                                                                  longitude : el.currentLocation.longitude - (0.001 * otp.rndNo()),
                                                                                                              },
                                                                                                              currentStatus: el.currentStatus,
                                                                                                              driverId: el.driverId + i + '-3',
                                                                                                              driverInfo: el.driverInfo,
                                                                                                              vehicleCategory: el.vehicleCategory,
                                                                                                              vehicleCategoryData: el.vehicleCategoryData,
                                                                                                              vehicleInfo: el.vehicleInfo,
                                                                                                              vehicleSubCategory: el.vehicleSubCategory
                                                                                                          });
                                                                                                      });
                                                                              */

            io.to(data1.socketId).emit("allOnlineDriversResult", data);
          }
        }
      });
    });

    await socket.on("getFailedDispatches", (data2) => {
      var fromDate = new Date(data2.from);
      var toDate = new Date(data2.to);

      var pageNo = data2.pageNo;
      var paginationCount = 15;

      var status = data2.status;
      var category = data2.category;

      var query1 = {
        $match: {
          $and: [
            {
              $or: [],
            },
            {
              $or: [
                {
                  customerName: { $regex: data2.text },
                },
                {
                  customerTelephoneNo: { $regex: data2.text },
                },
                {
                  "pickupLocation.address": { $regex: data2.text },
                },
                {
                  "realDropLocation.address": { $regex: data2.text },
                },
                {
                  "realPickupLocation.address": { $regex: data2.text },
                },
                // {
                //   "dropLocations.address" : { $regex: data2.text }
                // },
                //   {
                //     type: { $regex: data2.text }
                //   }
              ],
            },
            {
              pickupDateTime: {
                $gte: fromDate,
                $lt: toDate,
              },
            },
          ],
        },
      };

      if (status === "all") {
        query1.$match.$and[0].$or.push(
          {
            status: "canceled",
          },
          {
            status: "default",
          },
          {
            status: "accepted",
          }
        );
      } else {
        query1.$match.$and[0].$or.push({
          status: status,
        });
      }

      if (category !== "all") {
        query1.$match.$and.push({
          vehicleSubCategory: category,
        });
      }

      Dispatch.aggregate([query1]).exec(function (err, result) {
        if (err) {
          // res.status(500).send(err)
        } else {
          var query2 = {
            $match: {
              $and: [
                {
                  $or: [],
                },
                {
                  $or: [
                    {
                      "passengerDetails.name": { $regex: data2.text },
                    },
                    {
                      "passengerDetails.contactNumber": { $regex: data2.text },
                    },
                    {
                      "pickupLocation.address": { $regex: data2.text },
                    },
                    {
                      "realDropLocation.address": { $regex: data2.text },
                    },
                    {
                      "realPickupLocation.address": { $regex: data2.text },
                    },
                    // {
                    //   "dropLocations.address" : { $regex: data2.text }
                    // },
                    //   {
                    //     type: { $regex: data2.text }
                    //   }
                  ],
                },
                {
                  recordedTime: {
                    $gte: fromDate,
                    $lt: toDate,
                  },
                },
              ],
            },
          };

          if (status === "all") {
            query2.$match.$and[0].$or.push(
              {
                status: "canceled",
              },
              {
                status: "default",
              },
              {
                status: "accepted",
              }
            );
          } else {
            query2.$match.$and[0].$or.push({
              status: status,
            });
          }

          if (category !== "all") {
            query1.$match.$and.push({
              vehicleSubCategory: category,
            });
          }

          Trip.aggregate([query2]).exec(function (err, result1) {
            if (err) {
              // res.status(500).send(err)
            } else {
              result1.forEach((element) => {
                result.push(element);
              });

              result.sort((el1, el2) => {
                if (el1.recordedTime > el2.recordedTime) return -1;
                if (el1.recordedTime < el2.recordedTime) return 1;
              });
              var total = result.length;
              result = result.slice(
                (pageNo - 1) * paginationCount,
                pageNo * paginationCount
              );

              io.to(data2.socketId).emit("allFailedDispatches", {
                content: result,
                content1: [],
                total: total,
              });
            }
          });
        }
      });
    });

    // socket.on('getFailedDispatches', (data2) => {
    //     var fromDate = new Date(data2.from);
    //     var toDate = new Date(data2.to);

    //     //#######################################
    //     Dispatch.aggregate([{
    //         $match: {
    //             $and: [{
    //                 $or: [{
    //                     status: 'canceled'
    //                 }, {
    //                     status: 'default'
    //                 }, {
    //                     status: 'accepted'
    //                 }]
    //             },
    //             {
    //                 pickupDateTime: {
    //                     $gte: fromDate,
    //                     $lt: toDate
    //                 }
    //             }
    //             ],
    //         },

    //         // $match: {
    //         //   $and : [
    //         //     {status: 'canceled'},
    //         //     {pickupDateTime: { $gte: fromDate, $lt: toDate }}
    //         //   ]
    //         // }
    //     }])
    //         .exec(function (err, result) {
    //             if (err) {
    //                 res.status(500).send(err)
    //             } else {

    //                 Trip.aggregate([{
    //                     $match: {
    //                         $and: [{
    //                             $or: [{
    //                                 status: 'canceled'
    //                             }, {
    //                                 status: 'default'
    //                             }, {
    //                                 status: 'accepted'
    //                             }]
    //                         },
    //                         {
    //                             recordedTime: {
    //                                 $gte: fromDate,
    //                                 $lt: toDate
    //                             }
    //                         }
    //                         ],
    //                     },
    //                 }])
    //                     .exec(function (err, result1) {
    //                         if (err) {
    //                             // res.status(500).send(err)
    //                         } else {

    //                             result1.forEach(element => {
    //                                 result.push(element);
    //                             });

    //                             io.to(data2.socketId).emit('allFailedDispatches', {
    //                                 content: result,
    //                                 content1: result1
    //                             });

    //                             // res.status(200).json({
    //                             //     content: result,
    //                             //     content1: result1
    //                             // })
    //                         }
    //                     })
    //             }
    //         })
    //     //#######################################

    // });
  })
);

module.exports = app;
