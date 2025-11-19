import * as supplierService from "../services/supplier.service.js";
import { supplierSchema, supplierUpdateSchema } from "../utils/validation.js";
import ResponseError from "../utils/customError.js";

// 🟩 Create supplier (admin)
export async function createSupplier(req, res, next) {
  try {
    const { error } = supplierSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const userId = req.user.id; // admin performing action
    const supplier = await supplierService.createSupplier(userId, req.body);

    res
      .status(201)
      .json({ message: "Supplier created successfully", supplier });
  } catch (err) {
    next(err);
  }
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

// 🟨 Get My Supplier Data
export async function getMySupplierData(req, res, next) {
  try {
    const user = req.user;
    if (!user.supplierId) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }
    const supplier = await supplierService.getSupplierById(user.supplierId);

    if (!supplier || !supplier.supplier)
      throw new ResponseError("Supplier not found", 404);

    res.json(supplier.supplier);
  } catch (err) {
    next(err);
  }
}

// 🟨 Update my Supplier data
export async function updateMySupplierData(req, res, next) {
  try {
    const user = req.user;

    if (!user.supplierId) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }

    const { error } = supplierUpdateSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const supplier = await supplierService.updateSupplier(
      user.supplierId,
      req.body
    );

    res.json(supplier);
  } catch (err) {
    next(err);
  }
}

// 🟧 Update supplier
export async function updateSupplier(req, res, next) {
  try {
    const { error } = supplierUpdateSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const id = parseInt(req.params.id);

    const supplier = await supplierService.updateSupplier(id, req.body);
    if (!supplier) throw new ResponseError("Supplier not found", 404);

    res.json({ message: "Supplier updated successfully", supplier });
  } catch (err) {
    next(err);
  }
}

// ⬛ Delete supplier
export async function deleteSupplier(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const supplier = await supplierService.deleteSupplier(id);
    if (!supplier) throw new ResponseError("Supplier not found", 404);

    res.json({ message: "Supplier deleted successfully" });
  } catch (err) {
    next(err);
  }
}
