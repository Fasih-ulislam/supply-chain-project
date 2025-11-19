import express from "express";
import {
  registerUser,
  verifyOtp,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

export default router;
