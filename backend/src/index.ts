import { config } from "dotenv";
config();

// Environment Variable Validation
const mongoUrl = process.env.MONGO_URL;
const cookieSecret = process.env.COOKIE_SECRET;
const jwtSecret = process.env.JWT_SECRET;

if (!mongoUrl || !cookieSecret || !jwtSecret) {
  console.error("CRITICAL ERROR: Missing required environment variables! ❌");
  if (!mongoUrl) console.error("- MONGO_URL is missing");
  if (!cookieSecret) console.error("- COOKIE_SECRET is missing");
  if (!jwtSecret) console.error("- JWT_SECRET is missing");
  process.exit(1);
}

import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user-routes.js";
import chatRoutes from "./routes/chat-routes.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      const frontendUrl = process.env.FRONTEND_URL;
      if (
        !origin ||
        origin === frontendUrl ||
        origin === "http://localhost:5173" ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        console.log("Blocking blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(cookieSecret));
app.use(morgan("dev"));

// Routes
app.use("/api/user/", userRoutes);
app.use("/api/chat/", chatRoutes);

// MongoDB connection
mongoose
  .connect(mongoUrl)
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `Server started on port ${process.env.PORT || 8000} and MongoDB is connected ✅`
      );
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error ❌", err);
  });
