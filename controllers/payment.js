const express = require("express");
const paymentGateway = require("../services/paymentGateway");
const walletUpdate = require("../services/walletUpdate");

exports.topup = async function (req, res) {
  let walletStatus = await walletUpdate.updateDriverWallet(
    req.body.driverId,
    req.body.amount
  );

  if (walletStatus) {
    let token = await paymentGateway.getToken();

    if (token) {
      let accountStatus = await paymentGateway.accountValidation(
        req.body.partnerAccount,
        req.body.mobileNo,
        req.body.globalId,
        token
      );

      if (accountStatus) {
        let response = await paymentGateway.topup(
          req.body.partnerAccount,
          req.body.amount,
          req.body.mobileNo,
          req.body.email,
          req.body.globalId,
          token
        );

        if (response) {
          res.status(200).json({
            success: true,
            message: "Account Topup Successfully",
          });
        } else {
          await walletUpdate.updateDriverWallet(
            req.body.driverId,
            -req.body.amount
          );
          res.status(200).json({
            success: false,
            message: "Account Topup Failed",
          });
        }
      } else {
        await walletUpdate.updateDriverWallet(
          req.body.driverId,
          -req.body.amount
        );
        res.status(200).json({
          success: false,
          message: "Account Validation Failed",
        });
      }
    } else {
      await walletUpdate.updateDriverWallet(
        req.body.driverId,
        -req.body.amount
      );
      res.status(200).json({
        success: false,
        message: "Token Generation Failed",
      });
    }
  } else {
    res.status(200).json({
      success: false,
      message: "Account Topup Failed",
    });
  }
};

exports.refund = async function (req, res) {
  let walletStatus = await walletUpdate.updateDriverWallet(
    req.body.driverId,
    -req.body.amount
  );
  if (walletStatus) {
    let token = await paymentGateway.getToken();

    if (token) {
      let accountStatus = await paymentGateway.accountValidation(
        req.body.partnerAccount,
        req.body.mobileNo,
        req.body.globalId,
        token
      );

      if (accountStatus) {
        let response = await paymentGateway.refund(
          req.body.partnerAccount,
          req.body.amount,
          req.body.mobileNo,
          req.body.email,
          req.body.globalId,
          token
        );

        if (response) {
          res.status(200).json({
            success: true,
            message: "Account Refund Successfully",
          });
        } else {
          await walletUpdate.updateDriverWallet(
            req.body.driverId,
            req.body.amount
          );
          res.status(200).json({
            success: false,
            message: "Account Refund Failed",
          });
        }
      } else {
        await walletUpdate.updateDriverWallet(
          req.body.driverId,
          req.body.amount
        );
        res.status(200).json({
          success: false,
          message: "Account Validation Failed",
        });
      }
    } else {
      await walletUpdate.updateDriverWallet(req.body.driverId, req.body.amount);
      res.status(200).json({
        success: false,
        message: "Token Generating Failed",
      });
    }
  } else {
    res.status(200).json({
      success: false,
      message: "Account Refund Failed",
    });
  }
};
