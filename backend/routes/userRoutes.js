import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMe, updateProfile, getStats } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);
router.get("/stats", authMiddleware, getStats);

export default router;