import * as authService from "../services/auth.service.js";
import ResponseError from "../utils/customError.js";
import { pendingUserSchema } from "../utils/validation.js";
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
    const { email, password } = req.body;

    if (!email || !password)
      throw new ResponseError("Required fields not filled.", 400);

    const normalizedEmail = email.toLowerCase().trim();

    const user = await authService.loginUser({
      email: normalizedEmail,
      password,
    });

    //MAIN TOKEN
    const token = jwt.sign(
      {
        supplierId: user.supplierId,
        id: user.id,
        email: user.email,
        userRoles: user.userRoles,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    //Main cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, //only over HTTPS
      sameSite: "None",
      maxAge: 60 * 60 * 1000, //1 h
    });
    res.status(200).json({
      message: "Login successful",
      user: {
        email: user.email,
        roles: user.userRoles,
      },
    });
  } catch (err) {
    next(err);
  }
}

export const logoutUser = (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json("Logout Successfull");
};

export async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await authService.verifyOtp({ email: normalizedEmail, otp });
    res.status(201).json({ message: "User verified successfully", user });
  } catch (err) {
    next(err);
  }
}
