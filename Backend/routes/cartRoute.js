import express from "express";
import {
  addToCart,
  getUserCart,
  updateCart,
  restoreStockFromCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../middleware/Auth.js";  // Changed from default import to named import

const cartRouter = express.Router();

cartRouter.post("/add", verifyToken, addToCart);
cartRouter.post("/update", verifyToken, updateCart);
cartRouter.post("/get", verifyToken, getUserCart);
cartRouter.post("/restore-stock", verifyToken, restoreStockFromCart);

export default cartRouter;
