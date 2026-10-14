import express from "express";
import {
  getNotifications,
  markNotificationRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/:notificationId/read", protect, markNotificationRead);

export default router;
