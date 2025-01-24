import express from "express";

import {
  loginUser,
  registerUser,
  adminLogin,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);

export default userRouter;

// https://localhost/api/user/register
// https://localhost/api/user/login
// https://localhost/api/user/admin