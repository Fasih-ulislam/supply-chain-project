import express from "express";
import * as transporterController from "../controllers/transporter.controller.js";
import { authorizeRoles } from "../middlewares/validate.user.middleware.js";

const router = express.Router();

// 🟦 Get all transporters (any seller can view to select)
router.get(
  "/",
  authorizeRoles("ADMIN", "SUPPLIER", "DISTRIBUTOR", "RETAILER"),
  transporterController.getAllTransporters
);

// 🟦 Get transporter by ID
router.get(
  "/:id",
  authorizeRoles("ADMIN", "SUPPLIER", "DISTRIBUTOR", "RETAILER"),
  transporterController.getTransporterById
);

// 🟩 Create transporter (admin only)
router.post(
  "/",
  authorizeRoles("ADMIN"),
  transporterController.createTransporter
);

// 🟧 Update transporter (admin only)
router.patch(
  "/:id",
  authorizeRoles("ADMIN"),
  transporterController.updateTransporter
);

// ⬛ Delete transporter (admin only)
router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  transporterController.deleteTransporter
);

export default router;
