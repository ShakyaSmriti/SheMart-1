import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  allUsers,
  forgetPasswordMail,
  resetpasswordget,
  resetpassword,
  deleteUser,
  getProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/Auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin", adminLogin);

// Protected routes
router.get("/profile", verifyToken, getProfile);
router.put("/update", verifyToken, updateUserProfile);
router.delete("/delete", verifyToken, deleteUser);  

// Admin routes
router.get("/list", allUsers);
router.post("/remove/:id", deleteUser);

// Forget password routes
router.post("/forget-password", forgetPasswordMail);
router.get("/reset-password/:id/:token", resetpasswordget);
router.post("/reset-password/:id/:token", resetpassword);

export default router;
