"use strict";

const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
// const mongoose = require('mongoose');
const cors = require("cors");
const PassengerWallet = require("../models/passengerwallet");
const asyncHandler = require("express-async-handler");

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

exports.PassengerWallet = asyncHandler(async function (req, res) {
    console.log("###### Admin ######");
    await res.json({
        status: "passenger",
    });
});

//create a wallet for passenger
exports.createWallet = asyncHandler(async function (req, res) {
    console.log(req.body);
    if (req.body.passengerId) {
        const wallet = new PassengerWallet();
        wallet.passengerId = req.body.passengerId;

        await wallet.save(function (err, wallet) {
            if (err) {
                return res.status(500).send(err);
            } else {
                return res.status(200).json({message: "success!"});
            }
        });
    } else {
        return res.status(500).json({message: "Server Error!"});
    }
});

//recharge wallet amount of passenger
exports.rechargeWallet = asyncHandler(async function (req, res) {
    const newVals = {
        $inc: {
            totalWalletPoints: req.body.rechargeAmount,
        },
    };
    await PassengerWallet.findOneAndUpdate(
        {passengerId: req.body.passengerId},
        newVals,
        function (err, wallet) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).json({message: wallet});
            }
        }
    );
});

//update wallet amount of passenger
exports.updateWallet = asyncHandler(async function (req, res) {
    const newVals = {
        $set: {
            totalWalletPoints: req.body.rechargeAmount,
        },
    };
    await PassengerWallet.findOneAndUpdate(
        {passengerId: req.body.passengerId},
        newVals,
        function (err, wallet) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).json({message: wallet});
            }
        }
    );
});

//get wallet details of passenger
exports.getWallet = asyncHandler(async function (req, res) {
    await PassengerWallet.findOne(
        {passengerId: req.body.passengerId},
        function (err, wallet) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).json({
                    message: "success",
                    details: "get data Successfully",
                    content: wallet,
                });
            }
        }
    );
});

exports.addCard = asyncHandler(async function (req, res) {
    try {

        const card = {
            $set: {
                card: {
                    type: req.body.card.type,
                    number: req.body.card.number,
                    month: req.body.card.month,
                    year: req.body.card.year,
                    csv_code: req.body.card.csv_code,
                    owner_name: req.body.card.owner_name,
                }
            }
        };

        await PassengerWallet.findOneAndUpdate({passengerId: req.query.passengerId}, card, {
            new: true,
            returnDocument: "after",
        }).then(value => {
            res.status(200).json({
                message: "Card Add",
                details: "Card Add succeed",
                content: value,
            });
        }).catch(reason => {
            console.error(reason);
            res.status(500).json({error: reason});
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({error: e});
    }
});

exports.getCard = asyncHandler(async function (req, res) {
    try {
        await PassengerWallet.findOne({passengerId: req.query.passengerId}).then(value => {
            res.status(200).json({
                message: "Card Get",
                details: "Card get succeed",
                content: value.card,
            });
        }).catch(reason => {
            console.error(reason);
            res.status(500).json({error: reason});
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({error: e});
    }
});
