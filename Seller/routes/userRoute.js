import express from "express";

import {
  loginUser,
  registerUser,
  adminLogin,
  allUsers,
  deleteUser,
  forgetPasswordMail,
  resetpasswordget,
  resetpassword,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.get("/list", allUsers);
userRouter.post("/delete/:id", deleteUser);

// forget password routes
userRouter.post("/forget-password", forgetPasswordMail);
userRouter.get("/reset-password/:id/:token", resetpasswordget);
userRouter.post("/reset-password/:id/:token", resetpassword);

export default userRouter;
