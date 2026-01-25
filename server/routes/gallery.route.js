import express from "express";
import {
  createGallery,
  deleteGallery,
  getGalleries,
  getGallery,
  updateGallery,
} from "../controllers/gallery.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createGallery);
router.get("/", getGalleries);
router.get("/:id", getGallery);
router.put("/:id", verifyToken, updateGallery);
router.delete("/:id", verifyToken, deleteGallery);

export default router;
