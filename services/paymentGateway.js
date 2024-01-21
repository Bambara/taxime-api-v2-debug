const crypto = require("../util/crypto");
const cache = require("memory-cache");
const { default: axios } = require("axios");
// const config = require("../config");
// const driverwallet = require("../models/driverwallet");
require("dotenv").config();

exports.topup = function (
  partnerAccount,
  amount,
  mobileNo,
  email,
  globalId,
  token
) {
  let requestBody = {
    channel_id: process.env.CHANNEL_ID,
    partner_account: crypto.aesEncrypt(partnerAccount),
    amount: {
      value: amount,
      currency: "LKR",
    },
    external_reference: new Date().toISOString() + "/TOPUP/" + partnerAccount,
    mobile_no: crypto.aesEncrypt(mobileNo),
    email: email,
    global_id: crypto.aesEncrypt(globalId),
    remarks: "Topup-" + partnerAccount,
  };

  console.log("Topup Request: ", requestBody);

  return new Promise((resolve) => {
    axios
      .post(`${process.env.DFCC_HOST}transactions/topups`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        console.log("Topup Response: ", response.data);
        if (response.data.synapsys_code == "000") {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(() => {
        console.log("Topup: ", "Payment Gateway failed");
        resolve(false);
      });
  });
};

exports.refund = function (
  partnerAccount,
  amount,
  mobileNo,
  email,
  globalId,
  token
) {
  let requestBody = {
    channel_id: process.env.CHANNEL_ID,
    partner_account: crypto.aesEncrypt(partnerAccount),
    amount: {
      value: amount,
      currency: "LKR",
    },
    external_reference: new Date().toISOString() + "/REFUND/" + partnerAccount,
    mobile_no: crypto.aesEncrypt(mobileNo),
    email: email,
    global_id: crypto.aesEncrypt(globalId),
    remarks: "Refund-" + partnerAccount,
  };

  console.log("Refund Request: ", requestBody);

  return new Promise((resolve) => {
    axios
      .post(`${process.env.DFCC_HOST}transactions/returnfunds`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        console.log("Refund Response: ", response.data);
        if (response.data.synapsys_code == "000") {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(() => {
        console.log("Refund: ", "Payment Gateway failed");
        resolve(false);
      });
  });
};

exports.accountValidation = function (
  partnerAccount,
  mobileNo,
  globalId,
  token
) {
  let requestBody = {
    channel_id: process.env.CHANNEL_ID,
    account_no: crypto.aesEncrypt(partnerAccount),
    global_id_type: "NIC",
    external_reference: new Date().toISOString() + "/ACC_VAL/" + partnerAccount,
    mobile_no: crypto.aesEncrypt(mobileNo),
    global_id: crypto.aesEncrypt(globalId),
  };

  console.log("Validation Request: ", requestBody);

  return new Promise((resolve) => {
    axios
      .post(`${process.env.DFCC_HOST}accounts/validations`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        console.log("Validation Response: ", response.data);
        if (response.data.synapsys_code == "000") {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch((err) => {
        console.log("Payment Gateway Account Validation Failed");
        resolve(false);
      });
  });
};

exports.getToken = function () {
  return new Promise((resolve) => {
    let token = cache.get("token");
    if (token) {
      resolve(token);
    } else {
      let params = new URLSearchParams([
        ["client_id", process.env.CLIENT_ID],
        ["client_secret", process.env.CLIENT_SECRET],
      ]);
      axios
        .post(`${process.env.DFCC_HOST}token/obtain`, params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .then((response) => {
          cache.put(
            "token",
            response.data.access_token,
            response.data.expires_in
              ? (+response.data.expires_in - 10) * 1000
              : 290000
          );
          resolve(response.data.access_token);
        })
        .catch((err) => {
          console.log("Payment Gateway Token Generation Failed");
          resolve(false);
        });
    }
  });
};
