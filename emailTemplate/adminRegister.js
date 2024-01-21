"use strict";

const nodemailer = require("nodemailer");
// const config = require("../config");

require("dotenv").config();

const BASE_URL = process.env.BASE_URL;
const BASE_PORT = process.env.BASE_PORT;

exports.adminRegEmail = function (adminEmail, salt) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "projectaxeman@gmail.com",
      pass: "axeman2018",
    },
    tls: {
      rejectUnauthorized: false, //unathoutized access allow
    },
  });

  const link =
    BASE_URL.concat(":").concat(BASE_PORT) + "/admin/confirmemail/" + salt;

  const mailOptions = {
    from: "projectaxeman@gmail.com",
    to: `${adminEmail}`,
    subject: "Taxime",
    text: "Thank you for registering with Taxime",
    html: `<p>Please click <a href=${link}>here</a> to confirm your Email.</p>`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return error;
    } else {
      console.log("Email sent");
    }
  });
};
