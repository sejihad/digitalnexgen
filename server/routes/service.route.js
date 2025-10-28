import express from "express";
import {
  countServices,
  createService,
  deleteService,
  getService,
  getServices,
  updateService,
} from "../controllers/service.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// 🔐 Protected Routes (require login)
router.post("/", verifyToken, createService);
router.put("/:id", verifyToken, updateService);
router.delete("/:id", verifyToken, deleteService);

// 🔓 Public Routes
router.get("/count", countServices);
router.get("/single-service/:id", getService);
router.get("/", getServices);

export default router;
