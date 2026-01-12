import express from "express";
import {
  checkUsernameAvailability,
  deleteUser,
  getUser,
  getUserByUsername,
  getUsers,
  updateUser,
  updateUsername,
} from "../controllers/user.controller.js";
import { verifyAnyAuth } from "../middleware/authAny.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// Public endpoints
router.get("/", verifyToken, getUsers);
router.get("/by-username/:username", getUserByUsername);
router.get("/check-username", checkUsernameAvailability);

// Authenticated endpoints
router.delete("/:id", verifyAnyAuth, deleteUser);
router.get("/:id", verifyAnyAuth, getUser);
router.put("/:id", verifyAnyAuth, updateUser);
router.put("/me/username", verifyAnyAuth, updateUsername);

export default router;
