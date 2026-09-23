import express from "express";

import {
  sendTutorRequest,
  getReceivedRequests,
  acceptTutorRequest,
  rejectTutorRequest,
  getMyRequests,
  getMyStudents,
} from "../controllers/tutorRequestController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, sendTutorRequest);

router.get("/received", protect, getReceivedRequests);

router.get("/my", protect, getMyRequests);

router.get("/students", protect, getMyStudents);

router.patch("/:id/accept", protect, acceptTutorRequest);

router.patch("/:id/reject", protect, rejectTutorRequest);

export default router;