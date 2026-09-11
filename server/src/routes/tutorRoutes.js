import express from "express";

import {
  registerTutor,
  getMyTutorProfile,
  searchTutors,
  getTutorById,
} from "../controllers/tutorController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tutor registration
router.post("/register", registerTutor);

// Logged-in tutor application
router.get("/me", protect, getMyTutorProfile);

// Search approved tutors
router.get("/", searchTutors);

// View individual approved tutor
router.get("/:id", getTutorById);

export default router;