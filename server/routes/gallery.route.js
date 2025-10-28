import express from "express";
import {
  createGallery,
  deleteGallery,
  getGalleries,
} from "../controllers/gallery.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, createGallery);
router.get("/", getGalleries);
router.delete("/:id", verifyToken, deleteGallery);

export default router;
