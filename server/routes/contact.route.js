import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { sendContactMessage, adminListContacts, adminGetContact, adminUpdateStatus, adminDeleteContact } from "../controllers/contact.controller.js";

const router = express.Router();

router.post("/", sendContactMessage);

// Admin endpoints
router.get("/admin", verifyToken, adminListContacts);
router.get("/admin/:id", verifyToken, adminGetContact);
router.patch("/admin/:id/status", verifyToken, adminUpdateStatus);
router.delete("/admin/:id", verifyToken, adminDeleteContact);

export default router;
