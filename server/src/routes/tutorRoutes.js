import express from "express";

import {
  registerTutor,
  getMyTutorProfile,
} from "../controllers/tutorController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tutor registration
router.post("/register", registerTutor);

// Logged-in tutor application
router.get("/me", protect, getMyTutorProfile);

export default router;