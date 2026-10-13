const express = require("express");
const schemas = require("../validation/schemas");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/async-handler");
const {
  listCompanies,
  createCompany,
  signupCompany,
  updateCompany,
  removeCompany,
} = require("../controllers/company-controller");

function buildSuperAdminRouter(config) {
  const router = express.Router();
  router.use(authenticate(config), authorize("super_admin"));

  router.get(
    "/companies",
    validate(schemas.listQuery, "query"),
    asyncHandler(listCompanies),
  );
  router.post(
    "/companies/signup",
    validate(schemas.companySignup),
    asyncHandler(signupCompany),
  );
  router.post(
    "/companies",
    validate(schemas.companyCreate),
    asyncHandler(createCompany),
  );
  router.patch(
    "/companies/:companyId",
    validate(schemas.idParams, "params"),
    validate(schemas.companyUpdate),
    asyncHandler(updateCompany),
  );
  router.delete(
    "/companies/:companyId",
    validate(schemas.idParams, "params"),
    asyncHandler(removeCompany),
  );

  return router;
}

module.exports = { buildSuperAdminRouter };
