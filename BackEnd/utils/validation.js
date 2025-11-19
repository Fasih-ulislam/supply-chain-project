import Joi from "joi";

export const userSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/)
    .message(
      "Password must contain at least 1 uppercase, 1 lowercase letter, and 1 number."
    )
    .required(),
  picture: Joi.string().uri().optional(),
}).unknown(false);

export const pendingUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/)
    .message(
      "Password must contain at least 1 uppercase, 1 lowercase letter, and 1 number."
    )
    .required(),
}).unknown(false);

export const userUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/)
    .message(
      "Password must contain at least 1 uppercase, 1 lowercase letter, and 1 number."
    )
    .required(),
  picture: Joi.string().uri().optional(),
  supplierId: Joi.number().integer().optional(),
}).unknown(false);

// 🟩 Create Role Request Schema
export const roleRequestSchema = Joi.object({
  requestedRole: Joi.string()
    .valid("SUPPLIER", "DISTRIBUTOR", "RETAILER")
    .required(),

  businessName: Joi.string().trim().min(2).max(100).required(),

  businessAddress: Joi.string().trim().min(5).max(200).required(),

  contactNumber: Joi.string()
    .pattern(/^[0-9+\-]{7,15}$/)
    .message("Contact number must be digits and may include + or -")
    .required(),

  NTN: Joi.string().trim().allow(null, "").optional(),
}).unknown(false);

// 🟥 Update Role Request Status (Admin only)
export const updateRoleStatusSchema = Joi.object({
  status: Joi.string().valid("PENDING", "APPROVED", "REJECTED").required(),
}).unknown(false);

export const supplierSchema = Joi.object({
  companyName: Joi.string().trim().min(2).max(100).required(),
  contact: Joi.string().trim().min(5).max(50).required(),
  address: Joi.string().trim().min(5).max(255).required(),
}).unknown(false);

export const supplierUpdateSchema = Joi.object({
  companyName: Joi.string().trim().min(2).max(100).optional(),
  contact: Joi.string().trim().min(5).max(50).optional(),
  address: Joi.string().trim().min(5).max(255).optional(),
}).unknown(false);

export const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  category: Joi.string().trim().min(2).max(100).required(),
  batchNo: Joi.string().trim().min(2).max(100).required(),
  qrCode: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
}).unknown(false);

export const productUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  category: Joi.string().trim().min(2).max(100).optional(),
  batchNo: Joi.string().trim().min(2).max(100).optional(),
  qrCode: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  price: Joi.number().positive().optional(),
  stock: Joi.number().integer().min(0).optional(),
}).unknown(false);
