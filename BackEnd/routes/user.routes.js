import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authorizeRoles } from "../middlewares/validate.user.middleware.js";

const router = express.Router();

router.use(
  authorizeRoles("ADMIN", "SUPPLIER", "DISTRIBUTOR", "RETAILER", "CUSTOMER")
);
router.get("/", userController.getUserByEmail);
router.put("/", userController.updateUser);
router.delete("/", userController.deleteUser);

router.use(authorizeRoles("ADMIN"));
router.get("/all", userController.getAllUsers);

export default router;
