import express from "express";

import {
  createAssignment,
  getTutorAssignments,
  getStudentAssignments,
  submitAssignment,
} from "../controllers/assignmentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { uploadAssignmentFiles } from "../middleware/assignmentUpload.js";

const router = express.Router();

// Tutor creates assignment
router.post("/", protect, uploadAssignmentFiles, createAssignment);

// Tutor gets own assignments
router.get("/tutor", protect, getTutorAssignments);

// Student gets own assignments
router.get("/student", protect, getStudentAssignments);

// Student submits assignment text and optional PDF attachments
router.post(
  "/:assignmentId/submit",
  protect,
  uploadAssignmentFiles,
  submitAssignment
);

export default router;