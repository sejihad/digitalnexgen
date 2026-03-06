import express from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  updateUserRole,
} from "../controllers/user.controller.js";

import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// Public endpoints
router.get("/", verifyToken, getUsers);
// router.get("/by-username/:username", getUserByUsername);
// router.get("/check-username", checkUsernameAvailability);

// Authenticated endpoints
router.delete("/:id", verifyToken, deleteUser);
router.get("/:id", verifyToken, getUser);
router.put("/:id", verifyToken, updateUser);
router.put("/:id/role", verifyToken, updateUserRole);
// router.put("/me/username", verifyToken, updateUsername);

export default router;
