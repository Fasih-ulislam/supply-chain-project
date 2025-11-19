import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

export const validateUserMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
};

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user; // assumes user is already attached via JWT middleware

    const hasAccess =
      Array.isArray(user.userRoles) &&
      user.userRoles.some(({ role }) => allowedRoles.includes(role));

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };
}
