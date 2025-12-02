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

// Authorize based on activeRole (single role at a time)
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;

    // Check if user's activeRole is in the allowed roles
    if (!user.activeRole || !allowedRoles.includes(user.activeRole)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${allowedRoles.join(
          ", "
        )}. Your active role: ${user.activeRole || "none"}`,
      });
    }

    next();
  };
}

// Check if user has ANY of the roles (for reading available roles)
export function hasAnyRole(...roles) {
  return (req, res, next) => {
    const user = req.user;

    const hasAccess =
      Array.isArray(user.userRoles) &&
      user.userRoles.some(({ role }) => roles.includes(role));

    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };
}
