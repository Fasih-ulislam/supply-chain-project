import express from "express";
import * as inventoryController from "../controllers/inventory.controller.js";
import {
  validateUserMiddleware,
  authorizeRoles,
} from "../middlewares/validate.user.middleware.js";

const router = express.Router();

// 🟦 Public routes - browse stores
router.get("/stores", inventoryController.getAllStores);
router.get("/stores/:sellerId", inventoryController.getStore);

// 🔒 Protected routes - require authentication
router.use(validateUserMiddleware);

// 🟦 Get my inventory (seller's store)
router.get(
  "/protected/my",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER"),
  inventoryController.getMyInventory
);

// 🟩 Add product to inventory
router.post(
  "/protected",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER"),
  inventoryController.addToInventory
);

// 🟧 Update inventory quantity
router.patch(
  "/protected/:id",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER"),
  inventoryController.updateInventoryQuantity
);

// ⬛ Remove from inventory
router.delete(
  "/protected/:id",
  authorizeRoles("SUPPLIER", "DISTRIBUTOR", "RETAILER"),
  inventoryController.removeFromInventory
);

export default router;
