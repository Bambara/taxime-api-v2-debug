"use strict";

var express = require("express");
var router = express.Router();
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var config = require("../config");
var Driver = require("../models/driver");
var Admin = require("../models/admin");

exports.checkCompanyInfo = function (type, companyCode) {
  return new Promise((resolve, reject) => {
    Admin.findOne({
      companyCode: companyCode,
      companyType: type,
      isEnable: true,
    }).exec(function (err, agent) {
      if (err) {
        console.log(err);
        resolve(false);
      } else {
        if (agent == null) {
          console.log(
            "####################### Cannot find company ##########################"
          );
          resolve(false);
        } else {
          console.log(
            "####################### Company found ##########################"
          );
          var obj = {
            companyName: agent.companyName,
            companyCode: agent.companyCode,
          };
          console.log(obj);
          resolve(obj);
        }
      }
    });
  });
};
