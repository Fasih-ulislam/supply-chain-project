import express from "express";
import * as supplierController from "../controllers/supplier.controller.js";
import { authorizeRoles } from "../middlewares/validate.user.middleware.js";

const router = express.Router();

// i see my data
router.use(authorizeRoles("SUPPLIER"));

//router.get("/:id", supplierController.getSupplierById);
router.get("/me", supplierController.getMySupplierData);
router.put("/me", supplierController.updateMySupplierData);

// Admin-only actions
router.use(authorizeRoles("ADMIN"));
router.get("/all", supplierController.getAllSuppliers);
// router.post("/", supplierController.createSupplier);
// router.put("/:id", supplierController.updateSupplier);
// router.delete("/:id", supplierController.deleteSupplier);

export default router;
