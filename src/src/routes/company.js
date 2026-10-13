const express = require("express");
const schemas = require("../validation/schemas");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncHandler } = require("../utils/async-handler");
const {
  listProducts,
  addProduct,
  updateProduct,
  buildPrintCode,
  deleteProduct,
  restoreProduct,
} = require("../controllers/product-controller");

function buildCompanyRouter(config) {
  const router = express.Router();
  router.use(authenticate(config), authorize("company_admin"));

  router.get(
    "/products",
    validate(schemas.listQuery, "query"),
    asyncHandler(listProducts),
  );
  router.post(
    "/products",
    validate(schemas.productCreate),
    asyncHandler(addProduct),
  );
  router.patch(
    "/products/:productId",
    validate(schemas.idParams, "params"),
    validate(schemas.productUpdate),
    asyncHandler(updateProduct),
  );
  router.get(
    "/products/:productId/code",
    validate(schemas.idParams, "params"),
    validate(schemas.codeQuery, "query"),
    asyncHandler(buildPrintCode(config)),
  );
  router.delete(
    "/products/:productId",
    validate(schemas.idParams, "params"),
    asyncHandler(deleteProduct),
  );
  router.post(
    "/products/:productId/restore",
    validate(schemas.idParams, "params"),
    asyncHandler(restoreProduct),
  );

  return router;
}

module.exports = { buildCompanyRouter };
