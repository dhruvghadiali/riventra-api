const _ = require("lodash");
const Company = require("../models/company");
const Product = require("../models/product");
const User = require("../models/user");
const { httpError } = require("../utils/http-error");
const { serialize } = require("../utils/response");

async function listCompanies(req, res) {
  const { page, limit, search, status } = req.validated.query;
  const filter = {};

  if (search) {
    filter.companyName = { $regex: _.escapeRegExp(search), $options: "i" };
  }
  if (status !== "all") {
    filter.isActive = status === "active";
  }

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .populate("createdBy", "firstName lastName mobileNumber")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Company.countDocuments(filter),
  ]);

  res.status(200).json({
    companies: companies.map(serialize),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

async function createCompany(req, res) {
  const fields = _.pick(req.body, ["companyName", "address", "contactNumber"]);
  const company = await Company.create({ ...fields, createdBy: req.user._id });
  res.status(201).json({ company: serialize(company) });
}

async function signupCompany(req, res) {
  const companyFields = _.pick(req.body.company, [
    "companyName",
    "address",
    "contactNumber",
  ]);
  const adminFields = _.pick(req.body.admin, [
    "firstName",
    "lastName",
    "mobileNumber",
    "password",
  ]);
  const session = await Company.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const [company] = await Company.create(
        [{ ...companyFields, createdBy: req.user._id }],
        { session },
      );
      const [admin] = await User.create(
        [
          {
            ...adminFields,
            role: "company_admin",
            company: company._id,
          },
        ],
        { session },
      );
      result = { company: serialize(company), admin: serialize(admin) };
    });
  } finally {
    await session.endSession();
  }

  res.status(201).json(result);
}

async function updateCompany(req, res) {
  const updates = _.pick(req.body, [
    "companyName",
    "address",
    "contactNumber",
    "isActive",
  ]);
  if (updates.isActive === true) {
    updates.deletedAt = null;
  }
  const company = await Company.findByIdAndUpdate(
    req.params.companyId,
    updates,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!company) throw httpError(404, "Company not found", "Not Found");
  res.status(200).json({ company: serialize(company) });
}

async function removeCompany(req, res) {
  const company = await Company.findOneAndUpdate(
    { _id: req.params.companyId, isActive: true },
    { isActive: false, deletedAt: new Date() },
    { new: true },
  );

  if (!company) throw httpError(404, "Active company not found", "Not Found");

  await Promise.all([
    User.updateMany({ company: company._id }, { isActive: false }),
    Product.updateMany(
      { company: company._id, isActive: true },
      {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: req.user._id,
      },
    ),
  ]);

  res.status(200).json({ company: serialize(company) });
}

module.exports = {
  listCompanies,
  createCompany,
  signupCompany,
  updateCompany,
  removeCompany,
};
