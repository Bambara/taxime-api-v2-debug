"use strict";

// const nodemailer = require("nodemailer");
// const config = require("../config");
const sgMail = require("@sendgrid/mail");

require("dotenv").config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

exports.roadPickupEndEmail = function (userEmail, cost) {
  console.log("sending register otp");

  sgMail.setApiKey(SENDGRID_API_KEY);

  // var link = 'http://localhost:8085/user/confirmemail/'+ pin;

  var mailOptions = {
    to: `${userEmail}`,
    from: "info@taximelk.com",
    subject: "Taxime",
    text: "Thank you for using Taxime",
    html: `<p>Your trip is end. Payment for the trip is Rs: ${cost}.00</p>`,
  };

  sgMail.send(mailOptions, function (err, info) {
    if (err) {
      return error;
    } else {
      console.log("Email Sent");
    }
  });
};
