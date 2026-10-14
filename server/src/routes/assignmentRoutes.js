
import express from "express";

import {
  createAssignment,
  getTutorAssignments,
  getStudentAssignments,
  getAssignmentFile,
  submitAssignment,
  reviewAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { uploadAssignmentFiles } from "../middleware/assignmentUpload.js";

const router = express.Router();

// Tutor creates an assignment with optional PDFs.
router.post("/", protect, uploadAssignmentFiles, createAssignment);

// Tutor gets their own assignments.
router.get("/tutor", protect, getTutorAssignments);

// Student gets their own assignments.
router.get("/student", protect, getStudentAssignments);

// Redirect authorized users to a short-lived Cloudinary signed URL.
router.get("/:assignmentId/files/:fileKind/:fileIndex", protect, getAssignmentFile);

// Student submits assignment text and optional PDFs.
router.post(
  "/:assignmentId/submit",
  protect,
  uploadAssignmentFiles,
  submitAssignment
);

// Tutor reviews a submitted assignment.
router.patch(
  "/:assignmentId/review",
  protect,
  reviewAssignment
);

// Tutor deletes their own assignment.
router.delete(
  "/:assignmentId",
  protect,
  deleteAssignment
);

export default router;
