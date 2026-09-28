import express from "express";

import {
  createClassSession,
  getTutorSessions,
  getMySessions,
  tutorCheckIn,
  studentConfirmClass,
  tutorCheckOut,
} from "../controllers/classSessionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tutor creates a class
router.post("/", protect, createClassSession);

// Tutor sees their classes
router.get("/tutor", protect, getTutorSessions);

// Student sees their classes
router.get("/my", protect, getMySessions);

// Tutor arrives
router.patch("/:id/check-in", protect, tutorCheckIn);

// Student confirms
router.patch(
  "/:id/confirm",
  protect,
  studentConfirmClass
);

// Tutor leaves
router.patch(
  "/:id/check-out",
  protect,
  tutorCheckOut
);

export default router;