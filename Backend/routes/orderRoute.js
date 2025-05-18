import express from "express";
import {
  placeOrder,
  placeOrderKhalti,
  allOrders,
  userOrders,
  updateStatus,
  cancelOrder
} from "../controllers/orderController.js";

import adminAuth from "./../middleware/adminAuth.js";
import authUser from "./../middleware/Auth.js";

const orderRouter = express.Router();

// Admin features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/delete", adminAuth, updateStatus);

// Payment features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/khalti", authUser, placeOrderKhalti);

// User features
orderRouter.get("/userorders", authUser, userOrders);
orderRouter.post("/cancel", authUser, cancelOrder);

export default orderRouter;
