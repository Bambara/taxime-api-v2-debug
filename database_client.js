const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const chalk = require("chalk");

require("dotenv").config();

process.send = process.send || function () {};

exports.connectDB = asyncHandler(async () => {
    try {
        const DB_URL = process.env.DB_URL_DEV;

        mongoose.Promise = require("bluebird");
        mongoose.set("strictQuery", false);
        await mongoose
            .connect(DB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: true,
                useCreateIndex: true,
            })
            .then(() => {
                process.send("ready");
                console.info(chalk.green("Database Connection Successfully !"));
                /*        mongoose.connection.once("open", () => {
                                                                        console.info.bind("Database Connection Successfully !");
                                                                      });*/
            })
            .catch((error) => {
                console.error(chalk.redBright(error));
                console.error(chalk.redBright("Connection Error !"));
                process.exit(1);
                /*        mongoose.connection.on(
                                                                        "error",
                                                                        console.error.bind(console, "Connection Error !")
                                                                      );*/
            });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
});
