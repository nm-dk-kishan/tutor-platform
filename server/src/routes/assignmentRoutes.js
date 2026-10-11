import express from "express";

import {
  createAssignment,
  getTutorAssignments,
  getStudentAssignments,
} from "../controllers/assignmentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tutor creates assignment
router.post(
  "/",
  protect,
  createAssignment
);

// Tutor gets own assignments
router.get(
  "/tutor",
  protect,
  getTutorAssignments
);

// Student gets own assignments
router.get(
  "/student",
  protect,
  getStudentAssignments
);

export default router;