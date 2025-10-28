import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createBlog,
  deleteBlog,
  getBlog,
  getBlogs,
  updateBlog,
} from "../controllers/blog.controller.js";

const router = express.Router();

router.post("/", verifyToken, createBlog);
router.get("/", getBlogs);
router.get("/:id", getBlog);
router.put("/:id", verifyToken, updateBlog);
router.delete("/:id", verifyToken, deleteBlog);

export default router;
