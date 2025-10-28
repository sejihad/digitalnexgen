import express from "express";
import {
  deleteUser,
  getUser,
  updateUser,
  getUserByUsername,
  checkUsernameAvailability,
  updateUsername,
} from "../controllers/user.controller.js";
import { verifyAnyAuth } from "../middleware/authAny.js";

const router = express.Router();

// Public endpoints
router.get("/by-username/:username", getUserByUsername);
router.get("/check-username", checkUsernameAvailability);

// Authenticated endpoints
router.delete("/:id", verifyAnyAuth, deleteUser);
router.get("/:id", verifyAnyAuth, getUser);
router.put("/:id", verifyAnyAuth, updateUser);
router.put("/me/username", verifyAnyAuth, updateUsername);

export default router;
