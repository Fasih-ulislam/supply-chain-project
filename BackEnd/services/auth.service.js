import prisma from "../config/database.js";
import bcrypt from "bcrypt";
import ResponseError from "../utils/customError.js";
import { transporter, mailOptions } from "../config/nodemailer.js";

// 🟩 Generate OTP (6 digits)
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 🟦 Send OTP (mock for now)
async function sendOtpEmail(email, otp) {
  await transporter.sendMail(
    mailOptions(
      email,
      "Your OTP Code",
      `Your OTP is ${otp}`,
      `<p>Your OTP code is <b>${otp}</b>. It will expire in 5 minutes.</p>`
    )
  );
}

//Login User
export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ResponseError("Invalid Credentials");
  if (!(await bcrypt.compare(password, user.password)))
    throw new ResponseError("Invalid Credentials");
  return user;
}

// 🟨 Register new user (Step 1: send OTP)
export async function registerUser({ name, email, password }) {
  // 1️⃣ Check if user already exists in main table
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ResponseError("User already exists", 409);

  // 2️⃣ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOtp();

  // 3️⃣ Check if already pending → overwrite
  const existingPending = await prisma.pendingUser.findUnique({
    where: { email },
  });
  if (existingPending) {
    await prisma.pendingUser.delete({ where: { email } });
  }

  // 4️⃣ Create pending user entry
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await prisma.pendingUser.create({
    data: { name, email, password: hashedPassword, otp, otpExpiry },
  });

  // 5️⃣ Send OTP (currently logs to console)
  await sendOtpEmail(email, otp);

  return { message: "OTP sent to email" };
}

// 🟧 Verify OTP (Step 2: confirm + move to main User)
export async function verifyOtp({ email, otp }) {
  const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });
  if (!pendingUser) throw new ResponseError("No pending user found", 404);

  // 1️⃣ Check OTP and expiry
  if (pendingUser.otp !== otp) throw new ResponseError("Invalid OTP", 401);
  if (new Date() > pendingUser.otpExpiry) {
    await prisma.pendingUser.delete({ where: { email } });
    throw new ResponseError("OTP expired. Please register again.", 401);
  }

  // 2️⃣ Move user to main User table
  const newUser = await prisma.user.create({
    data: {
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: "CUSTOMER", // default role
    },
  });

  // 3️⃣ Clean up pending record
  await prisma.pendingUser.delete({ where: { email } });

  return newUser;
}
