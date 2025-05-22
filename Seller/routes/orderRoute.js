import express from "express";
import {
  placeOrder,
  placeOrderKhalti,
  allOrders,
  userOrders,
  updateStatus,
} from "../controllers/orderController.js";

import adminAuth from "./../middleware/adminAuth.js";
import authUser from "./../middleware/Auth.js";

const orderRouter = express.Router();

// Amdmin features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

// Payment features
orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/khalti", authUser, placeOrderKhalti);

// User features
orderRouter.get("/userorders", authUser, userOrders);

export default orderRouter;
