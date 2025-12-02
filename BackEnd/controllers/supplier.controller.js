import * as supplierService from "../services/supplier.service.js";
import { userUpdateSchema } from "../utils/validation.js";
import ResponseError from "../utils/customError.js";

// Helper to check if user has a specific role
function hasRole(user, role) {
  return (
    Array.isArray(user.userRoles) && user.userRoles.some((r) => r.role === role)
  );
}

// 🟦 Get all suppliers (admin)
export async function getAllSuppliers(req, res, next) {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
}

// 🟨 Get supplier by ID
export async function getSupplierById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const supplier = await supplierService.getSupplierById(id);

    if (!supplier) throw new ResponseError("Supplier not found", 404);

    res.json(supplier);
  } catch (err) {
    next(err);
  }
}

// 🟨 Get My Supplier Data (current user with SUPPLIER role)
export async function getMySupplierData(req, res, next) {
  try {
    if (!hasRole(req.user, "SUPPLIER")) {
      return res
        .status(403)
        .json({ message: "Access denied: You are not a supplier" });
    }

    const supplier = await supplierService.getSupplierById(req.user.id);

    if (!supplier) throw new ResponseError("Supplier not found", 404);

    res.json(supplier);
  } catch (err) {
    next(err);
  }
}

// 🟨 Update my Supplier data
export async function updateMySupplierData(req, res, next) {
  try {
    if (!hasRole(req.user, "SUPPLIER")) {
      return res
        .status(403)
        .json({ message: "Access denied: You are not a supplier" });
    }

    const { error } = userUpdateSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const supplier = await supplierService.updateSupplier(
      req.user.id,
      req.body
    );

    res.json(supplier);
  } catch (err) {
    next(err);
  }
}
