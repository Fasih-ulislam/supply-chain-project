import express from "express";
import userRoutes from "./routes/user.routes.js";
import roleRequestRoutes from "./routes/role.request.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import trackingEventRoutes from "./routes/tracking.event.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import transporterRoutes from "./routes/transporter.routes.js";
import errorHandler from "./middlewares/globalErrorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { validateUserMiddleware } from "./middlewares/validate.user.middleware.js";

//Main server instance
const app = express();

/***************** MIDDLEWARES ****************/
//Data format - limit payload size to prevent DoS
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//Security helmet
app.use(helmet());

//CORS --> Restrict to allowed origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
// Inventory/Stores (public browse, protected manage)
app.use("/api/inventory", inventoryRoutes);

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
//Order Routes
app.use("/api/protected/order", orderRoutes);
//Tracking Event Routes
app.use("/api/protected/tracking-event", trackingEventRoutes);
//Transporter Routes
app.use("/api/protected/transporter", transporterRoutes);

/***************** ERROR HANDLING ****************/
// Global Error Handler
app.use(errorHandler);

//Export
export default app;
