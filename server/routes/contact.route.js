import express from "express";
import { sendContactMessage } from "../controllers/contact.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/send-bulk-email", verifyToken, sendContactMessage);

export default router;
