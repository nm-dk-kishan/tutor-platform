import express from "express";

import {
  scheduleInterview,
} from "../controllers/interviewController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.patch(
  "/schedule/:tutorProfileId",
  protect,
  adminOnly,
  scheduleInterview
);

export default router;