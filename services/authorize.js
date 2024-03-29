var express = require("express");
var router = express.Router();
var app = express();

exports.authorize = function (roles = []) {
  // roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  if (typeof roles === "string") {
    roles = [roles];
  }

  return [
    // authenticate JWT token and attach user to request object (req.user)
    // expressJwt({ secret }),

    // authorize based on user role
    (req, res, next) => {
      console.log(req.user.role);
      if (roles.length && !roles.includes(req.user.role)) {
        // user's role is not authorized
        return res
          .status(401)
          .json({ message: "No access for this operation!" });
      }

      // authentication and authorization successful
      next();
    },
  ];
};
