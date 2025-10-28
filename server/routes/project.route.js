import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "../controllers/project.controller.js";

const router = express.Router();

router.post("/", verifyToken, createProject);
router.get("/", getProjects);
router.get("/:id", getProject);
router.put("/:id", verifyToken, updateProject);
router.delete("/:id", verifyToken, deleteProject);

export default router;