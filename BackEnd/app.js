import express from "express";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import errorHandler from "./middlewares/globalErrorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

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

//health check
app.get("/health-check", (req, res) => {
  res.status(200).json("OK");
});

// User Routes
app.use("/api/user", userRoutes);

// Auth Routes
app.use("/api/auth", authRoutes);

// Global Error Handler
app.use(errorHandler);

//Export
export default app;
