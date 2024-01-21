const https = require("https");
const axios = require("axios").default;
// var config = require("../config");

require("dotenv").config();

/* authenticate webx */
exports.webxAuth = async (
  carId,
  orderNumber,
  amount,
  currency,
  bankMID,
  customerEmail,
  customerId
) => {
  return axios
    .post(
      process.env.WEBXPAY_API + "/api/auth",
      {
        username: "taxime",
        password: "s^(KQh8~lN2W",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.status == 200 && response.data.token) {
        res.status(200).json({
          message: "success",
          details: "Webx authentication successfully",
          content: response.data.token,
        });
        //payFromToken(response.data.token, carId, orderNumber, amount, currency, bankMID, customerEmail, customerId);
      } else {
        res.status(500).json({
          message: "failed",
          details: "please try again",
          content: response.data.explanation,
        });
      }
    })
    .catch((error) => {
      //console.log(error);
      res.status(500).json({
        message: "failed",
        details: "please try again",
        content: "payment gateway authentication failed",
      });
      //return error;
    });
};

async function getCustomerCards(customerEmail, customerId) {
  return axios
    .get(
      process.env.WEBXPAY_API + "/api/cards",
      {
        customer: {
          email: customerEmail,
          id: customerId,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + bearerToken,
        },
      }
    )
    .then((response) => {
      if (response.status === 200 && response.data.success) {
        res.status(200).json({
          message: "success",
          details: "payment successful",
          content: response.data,
        });
      } else if (response.status === 200 && response.data.error) {
        if (response.data.type === "3ds") {
          res.status(200).json({
            message: "3ds",
            details: response.data.explanation,
            content: response.data.html3ds,
          });
        } else {
          res.status(500).json({
            message: "failed",
            details: "pay from token failed",
            content: response.data.explanation,
          });
        }
      } else {
        res.status(500).json({
          message: "failed",
          details: "please try again",
          content: response.data.explanation,
        });
      }
    })
    .catch((error) => {
      //console.log(error);
      res.status(500).json({
        message: "failed",
        details: "please try again",
        content: "pay from token request failed",
      });
      //return error;
    });
}

async function payFromToken(
  bearerToken,
  carId,
  orderNumber,
  amount,
  currency,
  bankMID,
  customerEmail,
  customerId
) {
  // const postData = JSON.stringify({
  //     "cardId": carId,
  //     "orderNumber": orderNumber,
  //     "amount": amount,
  //     "currency": currency,
  //     "BankMID" : bankMID,
  //     "Secure3dResponseURL" : "http://localhost/secure3dsPaymentResult",

  //     "customer":{
  //         "email": customerEmail,
  //         "id": customerId
  //     }
  // });

  return axios
    .post(
      process.env.WEBXPAY_API + "/api/cards/pay/token3ds",
      {
        cardId: carId,
        orderNumber: orderNumber,
        amount: amount,
        currency: currency,
        BankMID: bankMID,
        Secure3dResponseURL: "http://taximelive.codviz.com",

        customer: {
          email: customerEmail,
          id: customerId,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + bearerToken,
        },
      }
    )
    .then((response) => {
      if (response.status === 200 && response.data.success) {
        res.status(200).json({
          message: "success",
          details: "payment successful",
          content: response.data,
        });
      } else if (response.status === 200 && response.data.error) {
        if (response.data.type === "3ds") {
          res.status(200).json({
            message: "3ds",
            details: response.data.explanation,
            content: response.data.html3ds,
          });
        } else {
          res.status(500).json({
            message: "failed",
            details: "pay from token failed",
            content: response.data.explanation,
          });
        }
      } else {
        res.status(500).json({
          message: "failed",
          details: "please try again",
          content: response.data.explanation,
        });
      }
    })
    .catch((error) => {
      //console.log(error);
      res.status(500).json({
        message: "failed",
        details: "please try again",
        content: "pay from token request failed",
      });
      //return error;
    });
}

exports.sendSms = function (number, otp) {
  var msg = "Use " + otp + " to login with TaxiMe App.";

  https
    .get(
      "https://richcommunication.dialog.lk/api/sms/inline/send.php?destination=" +
        number +
        "&q=15519557384502&message=" +
        msg,
      (resp) => {
        let data = "";
        console.log("in here");
        // A chunk of data has been recieved.
        resp.on("data", (chunk) => {
          console.log("sendSms : sms send fail");
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          console.log("sendSms : sms send ok");
          console.log(data);
        });
      }
    )
    .on("error", (err) => {
      console.log(msg);
      console.log("#" + number + "#");
      console.log("######## sendSms : otp sms send error : " + err);
    });
};
