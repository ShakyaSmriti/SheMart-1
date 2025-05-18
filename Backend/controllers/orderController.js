// Placing orders using COD method

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// function to place an order using COD method
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.user?.id;

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

    // Get user data for email
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

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

    // Send order confirmation email
    sendOrderConfirmationEmail(user, newOrder);

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

// All orders data from admin panel
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
    const userId = req.user?.id;

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

// Cancel an order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?.id;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    // Find the order
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if the user owns this order
    if (order.userId !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to cancel this order" });
    }

    // Check if the order can be cancelled (e.g., not already delivered)
    if (order.status === "Delivered") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel a delivered order" });
    }

    // Update the order status to "Cancelled"
    order.status = "Cancelled";
    await order.save();

    return res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const sendOrderConfirmationEmail = async (user, order) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "shakyasmriti368@gmail.com",
        pass: process.env.EMAIL_PASS || "uqjr khpg yxya lsfv",
      },
    });

    // Format order items for email
    const itemsList = order.items.map(item => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.size}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${item.price}</td>
      </tr>`
    ).join('');

    // Email content
    const mailOptions = {
      from: '"SheMart" <noreply@shemart.com>',
      to: user.email,
      subject: "Order Confirmation - SheMart",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Thank You for Your Order!</h1>
            <p>Order #${order._id}</p>
          </div>
          
          <div style="padding: 20px;">
            <h2>Order Details</h2>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Total Amount:</strong> $${order.amount}</p>
            
            <h3>Shipping Address</h3>
            <p>${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.zipCode}</p>
            
            <h3>Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 8px; text-align: left;">Product</th>
                  <th style="padding: 8px; text-align: left;">Size</th>
                  <th style="padding: 8px; text-align: left;">Quantity</th>
                  <th style="padding: 8px; text-align: left;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <div style="margin-top: 30px;">
              <p>Thank you for shopping with SheMart. If you have any questions about your order, please contact our customer service.</p>
            </div>
          </div>
          
          <div style="background-color: #333; color: white; padding: 15px; text-align: center;">
            <p>&copy; ${new Date().getFullYear()} SheMart. All rights reserved.</p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
};

export {
  placeOrder,
  placeOrderKhalti,
  allOrders,
  userOrders,
  updateStatus,
  deleteOrder,
  cancelOrder,
  sendOrderConfirmationEmail,
};
