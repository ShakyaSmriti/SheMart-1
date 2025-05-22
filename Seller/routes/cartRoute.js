import express from "express";
import {
  addToCart,
  getUserCart,
  updateCart,
  restoreStockFromCart,
} from "../controllers/cartController.js";
import authUser from "../middleware/Auth.js";

const cartRouter = express.Router();

cartRouter.post("/add", authUser, addToCart);
cartRouter.post("/update", authUser, updateCart);
cartRouter.post("/get", authUser, getUserCart);
cartRouter.post("/restore-stock", authUser, restoreStockFromCart);

export default cartRouter;
