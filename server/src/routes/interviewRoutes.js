import express from "express";

import {
  scheduleInterview,
  completeInterview,
  approveTutor,
  rejectTutor,
  getTutorApplications,
  reapplyTutor,
  rescheduleInterview,
} from "../controllers/interviewController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Schedule
router.patch(
  "/schedule/:tutorProfileId",
  protect,
  adminOnly,
  scheduleInterview
);

// Complete interview
router.patch(
  "/complete/:tutorProfileId",
  protect,
  adminOnly,
  completeInterview
);

// Approve tutor
router.patch(
  "/approve/:tutorProfileId",
  protect,
  adminOnly,
  approveTutor
);

// Reject tutor
router.patch(
  "/reject/:tutorProfileId",
  protect,
  adminOnly,
  rejectTutor
);

// Get all tutor applications
router.get(
  "/applications",
  protect,
  adminOnly,
  getTutorApplications
);

router.patch("/reapply", protect, reapplyTutor);

router.patch(
  "/reschedule",
  protect,
  rescheduleInterview,
);


export default router;