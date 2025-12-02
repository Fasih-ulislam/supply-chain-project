import express from "express";
import {
  registerUser,
  verifyOtp,
  loginUser,
  logoutUser,
  switchRole,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { validateUserMiddleware } from "../middlewares/validate.user.middleware.js";
import {
  authLimiter,
  otpLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Apply rate limiting to sensitive auth routes
router.post("/register", otpLimiter, registerUser);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/login", authLimiter, loginUser);
router.get("/logout", logoutUser);

// Protected routes
router.use(validateUserMiddleware);
router.post("/switch-role", switchRole);
router.get("/me", getCurrentUser);

export default router;
