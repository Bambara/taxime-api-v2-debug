"use strict";

// const nodemailer = require("nodemailer");
const config = require("../config");
const sgMail = require("@sendgrid/mail");

require("dotenv").config();

const BASE_URL = process.env.BASE_URL;
const BASE_PORT = process.env.BASE_PORT;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

exports.driverRegEmail = function (driverEmail, salt) {
  sgMail.setApiKey(SENDGRID_API_KEY);

  const link =
    BASE_URL.concat(":").concat(BASE_PORT) + "/driver/confirmemail/" + salt;

  const msg = {
    to: `${driverEmail}`,
    from: "info@taximelk.com",
    subject: "Taxime",
    text: "Thank you for registering with Taxime",
    html: `<p>Please click <a href=${link}>here</a> to confirm your Email.</p>`,
  };

  sgMail.send(msg, function (err, info) {
    if (err) {
      return error;
    } else {
      console.log("Email Sent");
    }
  });
};
