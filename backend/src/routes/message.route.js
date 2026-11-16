import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  deleteMessage,
  editMessage,
  getMessages,
  getUsersForSidebar,
  markMessagesAsRead,
  sendMessage,
  toggleReaction,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.patch("/read/:id", protectRoute, markMessagesAsRead);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.patch("/:id", protectRoute, editMessage);
router.delete("/:id", protectRoute, deleteMessage);
router.post("/:id/react", protectRoute, toggleReaction);

export default router;
