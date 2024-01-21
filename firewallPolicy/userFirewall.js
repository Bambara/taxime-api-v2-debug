/* author ghost */
const { isIP } = require("net");

// const sendError = (res, errType, errMessage) => {
//     res.status(401).json({
//         "status": 0,
//         "message": errType,
//         "__data": {
//             "errors": errMessage
//         }
//     });
// };

const sendError = (res, errType, errMessage) => {
  res.status(401).json({
    status: 0,
    message: "failed",
    details: errType,
    content: errMessage,
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

// const checkPublicHeaders = (req, res, next) => {
//     const appSecret = req.headers['app-secret'];
//     const hash = req.headers['hash'];

//     if (isEmpty(hash) || isEmpty(appSecret)) {
//         console.log("\x1b[31mFIREWALL:\x1b[0m request from " + getIPAddress(req) + " was rejected because proper authorization headers could not be found");
//         sendError(res, 'Auth Error', "Proper authorization headers could not be found");
//         return;
//     }

//     next();
// };

// authorise passenger //
const userAuth = (req, res, next) => {
  console.log("###### user auth check ######");
  console.log(req.headers.authorization);
  console.log(req.headers["content-type"]);
  console.log(req.user);
  //res.json({status: 'login required'});
  if (req.user) {
    next();
  } else {
    sendError(res, "User authentication failed", "Auth user");
  }
};

const checkId = (req, res, next) => {
  if (!req.params.id || isEmpty(req.params.id)) {
    console.log(
      "\x1b[31mFIREWALL:\x1b[0m passenger request from " +
        getIPAddress(req) +
        " was rejected because invalid passenger id"
    );
    sendError(
      res,
      "passenger id param error",
      "Proper id param could not be found"
    );
    return;
  }

  next();
};

module.exports = {
  userAuth,
  checkId,
};
