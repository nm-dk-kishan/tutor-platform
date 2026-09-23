import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import tutorRequestRoutes from "./routes/tutorRequestRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

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

app.use("/api/attendance", attendanceRoutes);

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