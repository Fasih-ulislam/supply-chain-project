import express from "express";
import * as roleRequestController from "../controllers/role.request.controller.js";
import { authorizeRoles } from "../middlewares/validate.user.middleware.js";

const router = express.Router();

// Allow all authenticated user roles to create + view their requests
router.use(
  authorizeRoles("ADMIN", "SUPPLIER", "DISTRIBUTOR", "RETAILER", "CUSTOMER")
);

// 🟩 Create a new request
router.post("/", roleRequestController.createRoleRequest);

// 🟨 Get my role requests
router.get("/me", roleRequestController.getMyRoleRequests);

// ---------------------------
// ADMIN-ONLY ROUTES
// ---------------------------
router.use(authorizeRoles("ADMIN"));

// 🟦 Get all role requests
router.get("/all", roleRequestController.getAllRoleRequests);

// 🟦 Get all role requests
router.get("/pending", roleRequestController.getPendingRoleRequests);

// 🟧 Get a request by ID
router.get("/:id", roleRequestController.getRoleRequestById);

// 🟥 Approve / Reject a request
router.patch("/:id/status", roleRequestController.updateRoleRequestStatus);

// ⬛ Delete a request
router.delete("/:id", roleRequestController.deleteRoleRequest);

export default router;
