import express from "express";

import {
  markAttendance,
  getStudentAttendance,
  getMyAttendance,
  updateAttendance,
} from "../controllers/attendanceController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, markAttendance);

router.get("/my", protect, getMyAttendance);

router.get(
  "/student/:studentId",
  protect,
  getStudentAttendance
);

router.patch("/:id", protect, updateAttendance);

export default router;