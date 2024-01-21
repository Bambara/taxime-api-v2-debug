// var request = require("request");
const https = require("https");

// exports.sendSms = function (number, otp) {
//     var headers = {
//         'Content-Type': 'application/json'
//     }

//     var options = {
//         url: 'https://connect.nex-zent.com/otp/send_otp',
//         method: 'POST',
//         headers: headers,
//         form: {
//             SenderEmail: 'ashen@snaplk.com',
//             Password: '$/\/AP@4PP',
//             MessageContent: 'Use ' + otp + ' to login with TaxiMe App.',
//             ReceiverNumber: number,
//             UserPlatform: 'API'
//         }
//     }

//         request(options, function (error,res, body) {
//             if (error !== null) {
//                 console.log('sms error');
//             } else {
//                 console.log(res.body);
//             }
//         });
// }

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

exports.sendMsg = function (number, msg) {
  https
    .get(
      "https://richcommunication.dialog.lk/api/sms/inline/send.php?destination=" +
        number +
        "&q=15519557384502&message=" +
        msg,
      (resp) => {
        let data = "";

        // A chunk of data has been recieved.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          console.log("sendMsg: sms send ok");
          console.log(data);
        });
      }
    )
    .on("error", (err) => {
      console.log("sendMsg Error: " + err);
    });
};

exports.sendSmsCallback = function (number, otp, callback) {
  console.log("inside sms");
  var msg = "Use " + otp + " to login with TaxiMe App.";
  console.log(msg);
  console.log("#" + number + "#");
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
          //console.log('sms send fail')
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          console.log("sendSmsCallback: sms send ok");
          console.log(data);
          callback(1);
        });
      }
    )
    .on("error", (err) => {
      console.log("sendSmsCallback Error: " + err);
    });
};
