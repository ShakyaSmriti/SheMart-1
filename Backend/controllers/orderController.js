// Placing orders using COD method

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// function to place an order using COD method
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.user?.userId;

    // Check if user is authenticated
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User not authenticated" });
    }

    // Validate request body fields
    if (!items || !amount || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (items, amount, address)",
      });
    }

    // console.log("Order data:", req.body);

    const orderData = {
      userId,
      items,
      amount,
      paymentMethod: "COD",
      address,
      payment: false, // Assuming COD, update as necessary
      date: Date.now(),
    };

    // Create a new order
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Send success response
    return res
      .status(201)
      .json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error); // Improved error logging
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Placing orders using Khalti method
const placeOrderKhalti = async (req, res) => {};

// All orders data fro admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    return res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// user order data for frontend
const userOrders = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const orders = await orderModel.find({ userId });
    return res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// update order status from admin panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    return res.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(`orderId:`, orderId);

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID not provided" });
    }

    await orderModel.findByIdAndDelete(orderId);
    return res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderKhalti,
  allOrders,
  userOrders,
  updateStatus,
  deleteOrder,
};
