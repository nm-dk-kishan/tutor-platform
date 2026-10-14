import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import tutorRequestRoutes from "./routes/tutorRequestRoutes.js";
import classSessionRoutes from "./routes/classSessionRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";  
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const app = express();

const PORT = process.env.PORT || 5000;

// ================================
// Middleware
// ================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================================
// Routes
// ================================

app.use("/api/auth", authRoutes);

app.use("/api/tutors", tutorRoutes);

app.use("/api/tutor-requests", tutorRequestRoutes);

app.use("/api/interviews", interviewRoutes);

app.use("/api/class-sessions", classSessionRoutes);

app.use(
  "/api/assignments",
  assignmentRoutes
);
app.use("/api/notifications", notificationRoutes);

// ================================
// Health Check
// ================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tutor API is running",
  });
});

// ================================
// Database
// ================================

connectDB();

// ================================
// Start Server
// ================================

app.listen(PORT, () => {
  console.log(
    `Tutor server running on http://localhost:${PORT}`
  );
});