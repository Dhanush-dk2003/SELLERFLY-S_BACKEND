// routes/messageRoutes.js
import express from "express";
import {
  getMessages,
  createMessage,
  deleteMessage,
  updateMessageStatus
} from "../controllers/messageController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/", protect, getMessages);
router.post("/", protect, createMessage);
router.delete("/:id", protect, deleteMessage);
router.patch("/:id/status", protect, updateMessageStatus);

export default router;
