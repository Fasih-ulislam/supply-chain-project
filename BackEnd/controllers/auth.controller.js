import * as authService from "../services/auth.service.js";
import ResponseError from "../utils/customError.js";
import {
  pendingUserSchema,
  loginSchema,
  otpSchema,
  switchRoleSchema,
} from "../utils/validation.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      throw new ResponseError("Required fields not filled.", 400);

    const { error } = pendingUserSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const normalizedEmail = email.toLowerCase().trim();

    const response = await authService.registerUser({
      name,
      email: normalizedEmail,
      password,
    });

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const { email, password, activeRole } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await authService.loginUser({
      email: normalizedEmail,
      password,
    });

    // Validate activeRole if provided
    let selectedRole = activeRole;
    const userRoleNames = user.userRoles.map((r) => r.role);

    if (activeRole) {
      // Check if user has the requested role
      if (!userRoleNames.includes(activeRole)) {
        throw new ResponseError(
          `You do not have the ${activeRole} role. Available roles: ${userRoleNames.join(
            ", "
          )}`,
          403
        );
      }
    } else {
      // Default to first role if not specified
      selectedRole = userRoleNames[0] || "CUSTOMER";
    }

    // Create JWT with activeRole
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        activeRole: selectedRole,
        userRoles: user.userRoles,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        activeRole: selectedRole,
        availableRoles: userRoleNames,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Switch active role (user must have the role)
export async function switchRole(req, res, next) {
  try {
    const { error } = switchRoleSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const { role } = req.body;
    const user = req.user;

    const userRoleNames = user.userRoles.map((r) => r.role);

    if (!userRoleNames.includes(role)) {
      throw new ResponseError(
        `You do not have the ${role} role. Available roles: ${userRoleNames.join(
          ", "
        )}`,
        403
      );
    }

    // Create new JWT with updated activeRole
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        activeRole: role,
        userRoles: user.userRoles,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      message: `Switched to ${role} role`,
      activeRole: role,
    });
  } catch (err) {
    next(err);
  }
}

export const logoutUser = (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json("Logout Successful");
};

export async function verifyOtp(req, res, next) {
  try {
    const { error } = otpSchema.validate(req.body);
    if (error) throw new ResponseError(error.details[0].message, 400);

    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await authService.verifyOtp({ email: normalizedEmail, otp });
    res.status(201).json({ message: "User verified successfully", user });
  } catch (err) {
    next(err);
  }
}

// Get current user info
export async function getCurrentUser(req, res, next) {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      email: user.email,
      activeRole: user.activeRole,
      availableRoles: user.userRoles.map((r) => r.role),
    });
  } catch (err) {
    next(err);
  }
}
