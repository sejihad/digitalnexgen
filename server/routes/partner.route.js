import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createPartner,
  getPartners,
  getPartner,
  updatePartner,
  deletePartner,
} from "../controllers/partner.controller.js";

const router = express.Router();

router.post("/", verifyToken, createPartner);
router.get("/", getPartners);
router.get("/:id", getPartner);
router.put("/:id", verifyToken, updatePartner);
router.delete("/:id", verifyToken, deletePartner);

export default router;
