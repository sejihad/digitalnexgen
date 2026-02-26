import express from "express";
import {
  sendContactMessage,
  sendMessage,
} from "../controllers/contact.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/send-bulk-email", verifyToken, sendContactMessage);
router.post("/send-email", sendMessage);

export default router;
