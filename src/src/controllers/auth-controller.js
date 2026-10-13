const jwt = require("jsonwebtoken");
const _ = require("lodash");
const User = require("../models/user");
const { httpError } = require("../utils/http-error");
const { serialize } = require("../utils/response");

function buildAuthController(config) {
  async function signupSuperAdmin(req, res) {
    if (req.get("x-admin-signup-key") !== config.superAdminSignupKey) {
      throw httpError(403, "The admin signup key is invalid", "Forbidden");
    }

    const fields = _.pick(req.body, [
      "firstName",
      "lastName",
      "mobileNumber",
      "password",
    ]);
    const user = await User.create({ ...fields, role: "super_admin" });

    res.status(201).json({ user: serialize(user) });
  }

  async function signin(req, res) {
    const user = await User.findOne({
      mobileNumber: req.body.mobileNumber,
    }).select("+password");

    if (
      !user ||
      !user.isActive ||
      !(await user.verifyPassword(req.body.password))
    ) {
      throw httpError(401, "Invalid mobile number or password", "Unauthorized");
    }

    const token = jwt.sign(
      { role: user.role, company: user.company?.toString() || null },
      config.jwtSecret,
      { subject: user.id, expiresIn: config.jwtExpiresIn, algorithm: "HS256" },
    );

    res.status(200).json({
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: config.jwtExpiresIn,
      user: serialize(user),
    });
  }

  return { signupSuperAdmin, signin };
}

module.exports = { buildAuthController };
