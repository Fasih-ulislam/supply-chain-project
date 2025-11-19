import express from "express";
import userRoutes from "./routes/user.routes.js";
import roleRequestRoutes from "./routes/role.request.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import errorHandler from "./middlewares/globalErrorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { validateUserMiddleware } from "./middlewares/validate.user.middleware.js";

//Main server instance
const app = express();

/***************** MIDDLEWARES ****************/
//Data format
app.use(express.json());
//Security helmet
app.use(helmet());
//CORS --> config frontend later !!!
app.use(
  cors({
    credentials: true,
  })
);
//Allow cookies
app.use(cookieParser());

/***************** ROUTING ****************/

// -------> Open Routes <--------
//health check
app.get("/health-check", (req, res) => {
  res.status(200).json("OK");
});
// Auth Routes
app.use("/api/auth", authRoutes);

// -------> Protected Routes <--------

//Main line of defence (NEVER REMOVE !!!)
app.use(validateUserMiddleware);
// User Routes
app.use("/api/protected/user", userRoutes);
//Role Request Routes
app.use("/api/protected/role-request", roleRequestRoutes);
//Supplier Routes
app.use("/api/protected/supplier", supplierRoutes);
//Product Routes
app.use("/api/protected/product", productRoutes);
/***************** ERROR HANDLING ****************/
// Global Error Handler
app.use(errorHandler);

//Export
export default app;
