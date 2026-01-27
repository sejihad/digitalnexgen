import express from "express";
import {
  getStatistic,
  updateStatistic,
} from "../controllers/statistic.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// Public endpoints
router.get("/", getStatistic);
router.put("/", verifyToken, updateStatistic);

export default router;
