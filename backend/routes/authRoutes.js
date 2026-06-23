import express from "express";
import jwt from "jsonwebtoken";
import {
  registerUser,
  loginUser
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Parse JWT Token
router.get("/parse-token", (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    res.json({
      token,
      decoded
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid token"
    });
  }
});

export default router;