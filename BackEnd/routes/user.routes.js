import express from "express";
import * as userController from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/email/:email", userController.getUserByEmail);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
