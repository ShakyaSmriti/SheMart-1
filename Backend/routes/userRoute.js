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
  updateUserProfile, // Import the updateUserProfile controller
} from "../controllers/userController.js";
import authUser from "../middleware/Auth.js";
import upload from "../middleware/multer.js"; // Import multer middleware

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.get("/list", allUsers);
userRouter.post("/remove/:id", deleteUser);

// Profile route (protected)
userRouter.get("/profile", authUser, getProfile); // Get profile (protected)
userRouter.put(
  "/update",
  authUser,
  upload.single("profilePicture"),
  updateUserProfile
); 

// Forget password routes
userRouter.post("/forget-password", forgetPasswordMail);
userRouter.get("/reset-password/:id/:token", resetpasswordget);
userRouter.post("/reset-password/:id/:token", resetpassword);

export default userRouter;
