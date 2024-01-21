/* author ghost */
const { isIP } = require("net");

const sendError = (res, errType, errMessage) => {
  res.status(401).json({
    status: 0,
    message: errType,
    __data: {
      errors: errMessage,
    },
  });
};

const isEmpty = (value) => {
  if (value === null) {
    return true;
  }

  if (value === "") {
    return true;
  }

  if (value === undefined) {
    return true;
  }
};

const checkInteger = (value) => {
  if (isNaN(value)) {
    return false;
  }
  return true;
};

const onlyLetters = (value) => {
  if (!value) {
    return false;
  }
  return value.match(/^[A-Za-z ]*$/);
};

const isAlnum = (value) => {
  if (!value) {
    return false;
  }
  return value.match(/^[A-Za-z0-9 ]*$/);
};

const checkDriverRegister = (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    nic,
    birthday,
    mobile,
    gender,
    address,
    street,
    city,
    zipcode,
    country,
    lifeInsuranceNo,
    lifeInsuranceExpiryDate,
    lifeInsuranceAmount,
  } = req.body;
  const {
    driverPic,
    nicFrontPic,
    nicBackPic,
    drivingLicenceFrontPic,
    drivingLicenceBackPic,
  } = req.files;

  if (
    isEmpty(driverPic) ||
    isEmpty(nicFrontPic) ||
    isEmpty(nicBackPic) ||
    isEmpty(drivingLicenceFrontPic) ||
    isEmpty(drivingLicenceBackPic)
  ) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper some images could not be found"
    );
    sendError(res, "driver register param error", "All images required");
    return;
  }

  if (isEmpty(firstName) || !onlyLetters(firstName)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper firstName param could not be found"
    );
    sendError(
      res,
      "driver register param error",
      "Proper firstName param could not be found"
    );
    return;
  }

  if (isEmpty(lastName) || !onlyLetters(lastName)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper lastName param could not be found"
    );
    sendError(
      res,
      "driver register param error",
      "Proper lastName param could not be found"
    );
    return;
  }

  if (isEmpty(email)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper email param could not be found"
    );
    sendError(
      res,
      "driver register param error",
      "Proper email param could not be found"
    );
    return;
  }

  if (isEmpty(nic)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper nic param could not be found"
    );
    sendError(
      res,
      "driver register param error",
      "Proper nic param could not be found"
    );
    return;
  }

  if (isEmpty(birthday)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper birthday param could not be found"
    );
    sendError(
      res,
      "driver register param error",
      "Proper birthday param could not be found"
    );
    return;
  }

  if (isEmpty(mobile)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper mobile param could not be found"
    );
    sendError(
      res,
      "driver register param error",
      "Proper mobile param could not be found"
    );
    return;
  }

  if (isEmpty(gender) || !onlyLetters(gender)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper gender param could not be found"
    );
    sendError(
      res,
      "driver register param error",
      "Proper gender param could not be found"
    );
    return;
  }

  if (isEmpty(address)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper address param could not be found"
    );
    sendError(
      res,
      "driver register param error",
      "Proper address param could not be found"
    );
    return;
  }

  if (isEmpty(street)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper street param could not be found"
    );
    sendError(
      res,
      "driver register param error",
      "Proper street param could not be found"
    );
    return;
  }

  if (isEmpty(city)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m driver register request from " +
        getIPAddress(req) +
        " was rejected because proper city param could not be found"
    );
    sendError(
      res,
      "driver register param error",
      "Proper city param could not be found"
    );
    return;
  }

  next();
};

module.exports = {
  checkDriverRegister,
};
