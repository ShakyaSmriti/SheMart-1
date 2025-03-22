import express from "express";

import {
  loginUser,
  registerUser,
  adminLogin,
  forgetPasswordMail,
  resetpasswordget,
  resetpassword,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);

// forget password routes
userRouter.post("/forget-password", forgetPasswordMail);
userRouter.get("/reset-password/:id/:token", resetpasswordget);
userRouter.post("/reset-password/:id/:token", resetpassword);

export default userRouter;

// https://localhost/api/user/register
// https://localhost/api/user/login
// https://localhost/api/user/admin
