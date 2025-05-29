import express from "express";
import {
  placeOrder,
  placeOrderKhalti,
  allOrders,
  userOrders,
  updateStatus,
  deleteOrder,
  cancelOrder,
} from "../controllers/orderController.js";

import adminAuth from "../middleware/adminAuth.js";
import { verifyToken } from "../middleware/Auth.js";

const orderRouter = express.Router();

// Admin features
orderRouter.post("/list", allOrders);
orderRouter.post("/status",  updateStatus);
orderRouter.post("/delete", adminAuth, deleteOrder);

// Payment features
orderRouter.post("/place", verifyToken, placeOrder);
orderRouter.post("/khalti", verifyToken, placeOrderKhalti);

// User features
orderRouter.get("/userorders", verifyToken, userOrders);
orderRouter.post("/cancel", verifyToken, cancelOrder);

export default orderRouter;
