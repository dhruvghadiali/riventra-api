const express = require("express");
const { rateLimit } = require("express-rate-limit");
const schemas = require("../validation/schemas");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/async-handler");
const { buildAuthController } = require("../controllers/auth-controller");

function buildAuthRouter(config) {
  const router = express.Router();
  const controller = buildAuthController(config);
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });

  router.post(
    "/super-admin/signup",
    authLimiter,
    validate(schemas.superAdminSignup),
    asyncHandler(controller.signupSuperAdmin),
  );
  router.post(
    "/super-admin/signin",
    authLimiter,
    validate(schemas.signin),
    asyncHandler(controller.signin),
  );
  router.post(
    "/company/signin",
    authLimiter,
    validate(schemas.signin),
    asyncHandler(controller.signin),
  );
  router.post(
    "/signin",
    authLimiter,
    validate(schemas.signin),
    asyncHandler(controller.signin),
  );

  return router;
}

module.exports = { buildAuthRouter };
