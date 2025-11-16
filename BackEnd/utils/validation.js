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
  role: Joi.string()
    .valid("SUPPLIER", "DISTRIBUTOR", "RETAILER", "CUSTOMER")
    .optional(),
  supplierId: Joi.number().integer().optional(),
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
  role: Joi.string()
    .valid("SUPPLIER", "DISTRIBUTOR", "RETAILER", "CUSTOMER")
    .optional(),
  supplierId: Joi.number().integer().optional(),
}).unknown(false);
