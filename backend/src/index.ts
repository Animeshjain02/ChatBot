// import express from "express";
// import mongoose from "mongoose";
// import morgan from "morgan";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import connectDB from "./db.js";
// import userRoutes from "./routes/user-routes.js";
// import chatRoutes from "./routes/chat-routes.js";

// import { config } from "dotenv";

// config();

// const app = express();

// // Middlewares

// app.use(cors({origin:"http://localhost:5173", credentials: true}));
// app.use(express.json());
// app.use(cookieParser(process.env.COOKIE_SECRET))
// app.use(morgan("dev")); // for development

// // routes
// app.use("/api/user/", userRoutes);
// app.use("/api/chat/", chatRoutes);

// // Connections and Listeners
// mongoose
// 	.connect(
// 		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@new-cluster.syllbdh.mongodb.net/ai-chat-bot`
// 	)
// 	.then(() => {
// 		app.listen(process.env.PORT || 5000);
// 		console.log(
// 			`Server started on port ${
// 				process.env.PORT || 5000
// 			} and Mongo DB is connected`
// 		);
// 	})
// 	.catch((err) => {
// 		console.log(err);
// 	});

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
