const express = require("express");
const path = require("path");
// var favicon = require('serve-favicon');
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// var mongodb = require('mongodb');
// var nodemailer = require('nodemailer');
// var https = require('https');
// var http = require('http');
// var fs = require('fs');
// const mongoose = require("mongoose");
// const config = require("./config");
const jsonwebtoken = require("jsonwebtoken");
const fileUpload = require("express-fileupload");
const chalk = require("chalk");
require("dotenv").config();

//routers
const index = require("./routes/index");
const user = require("./routes/user");
const driver = require("./routes/driver");
const admin = require("./routes/admin");
const vehicleCategory = require("./routes/vehiclecategory");
const vehicle = require("./routes/vehicle");
const dispatch = require("./routes/dispatch");
const corporateUser = require("./routes/corporateUser");
const roadPickup = require("./routes/roadPickup");
const dispatcher = require("./routes/dispatcher");
const driverWallet = require("./routes/driverWallet");
const dispatcherWallet = require("./routes/dispatcherWallet");
const trip = require("./routes/trip");
const passengerWallet = require("./routes/passengerWallet");
const payment = require("./routes/payment");
const dbClient = require("./database_client");

const BASE_URL = process.env.BASE_URL;
const BASE_PORT = process.env.BASE_PORT;
const APP_NAME = process.env.APP_NAME;

const app = express();
app.use(fileUpload());

const cors = require("cors");
app.use(cors());

// app.use(express.static("/public"));
// app.use("/public", express.static("/public"));

app.use(express.static(path.join(__dirname, "public")));

/* port handler */
//default port 8095
// const BASE_PORT = BASE_PORT;
// const portDriver = config.DRIVER_PORT;
const appName = APP_NAME;

app.listen(BASE_PORT, function () {
  console.info(chalk.blue(appName + " API App listening on port " + BASE_PORT));
});

//Connect to MongoDB
dbClient.connectDB();

// app.listen(portDriver, function () {
//     console.log(appName + " API App listening on port " + portDriver);
// });

/*//#### DB connection #### //
// var uri = "mongodb://pikanite:Pikanite@pikanite-shard-00-00-ctz3b.mongodb.net:27017,pikanite-shard-00-01-ctz3b.mongodb.net:27017,pikanite-shard-00-02-ctz3b.mongodb.net:27017/devpikanitedb?ssl=true&replicaSet=Pikanite-shard-0&authSource=admin";
// mongoose.connect(uri);
const dbe = config.DB_URL_DEV;

try {
  mongoose.Promise = require("bluebird");
  mongoose.set("strictQuery", false);
  mongoose.connect(dbe, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  mongoose.connection.on(
    "error",
    console.error.bind(console, "Connection Error !")
  );
  mongoose.connection.once("open", () => {
    console.info("Database Connection Successfully !");
  });
} catch (e) {
  console.error(e);
  process.exit(1);
}*/

/*try {
  const URL = process.env.DB_URL_DEV;

  mongoose.Promise = require("bluebird");
  mongoose.set("strictQuery", false);
  mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  mongoose.connection.on(
    "error",
    console.error.bind(console, "Connection Error !")
  );
  mongoose.connection.once("open", () => {
    console.info("Database Connection Successfully !");
  });
} catch (e) {
  console.error(e);
  process.exit(1);
}*/

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan("Taxime_log"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

/* author ghost */
global.getIPAddress = function (req) {
  return req.header("x-forwarded-for") || req.connection.remoteAddress;
};

//Token middleware
app.use(function (req, res, next) {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    jsonwebtoken.verify(
      req.headers.authorization.split(" ")[1],
      "RESTFULAPIs",
      function (err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
});

app.get("/a", function (req, res) {
  res.json("User: ");
});
app.use("/", index); //home page info : welcome page
app.use("/user", user);
app.use("/driver", driver);
app.use("/admin", admin);
app.use("/vehicleCategory", vehicleCategory);
app.use("/dispatch", dispatch);
app.use("/corporateUser", corporateUser);
app.use("/roadPickup", roadPickup);
app.use("/vehicle", vehicle);
app.use("/dispatcher", dispatcher);
app.use("/driverWallet", driverWallet);
app.use("/dispatcherWallet", dispatcherWallet);
app.use("/trip", trip);
app.use("/passengerWallet", passengerWallet);
app.use("/payment", payment);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

//enable CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
