// Placing orders using COD method

import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// function to place an order using COD method
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod, payment, transactionId } = req.body;
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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const orderData = {
      userId,
      items,
      amount,
      paymentMethod: paymentMethod || "COD", // Use provided payment method or default to COD
      address,
      payment: payment || false, // Use provided payment status or default to false for COD
      date: Date.now(),
      transactionId: transactionId || null // Include transaction ID if provided
    };

    console.log("Creating order with payment method:", orderData.paymentMethod);

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
    // Find all orders and sort by date in descending order (newest first)
    const orders = await orderModel.find({}).sort({ date: -1 });
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

    // Find user's orders and sort by date in descending order (newest first)
    const orders = await orderModel.find({ userId }).sort({ date: -1 });
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
    
    // Find the order first
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    
    // Don't allow changing status if order is already cancelled
    if (order.status === "Cancelled" && status !== "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update status of a cancelled order",
      });
    }
    
    // Update the order status
    order.status = status;
    await order.save();
    
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
    const { orderId } = req.body;
    
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID not provided" });
    }

    // Find the order first to make sure it exists
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Delete the order
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
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">${item.size || 'N/A'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">Rs. ${item.price.toLocaleString()}</td>
      </tr>`
    ).join('');

    // Format address correctly based on the structure
    let formattedAddress = 'Address not provided';
    
    if (order.address) {
      if (typeof order.address === 'string') {
        formattedAddress = order.address;
      } else if (typeof order.address === 'object') {
        // Handle different address formats
        if (order.address.street) {
          // Format: { street, city, state, zipCode }
          formattedAddress = `${order.address.street || ''}, ${order.address.city || ''}, ${order.address.state || ''} ${order.address.zipCode || ''}`;
        } else if (order.address.address) {
          // Format: { address, city, ... }
          formattedAddress = `${order.address.address || ''}, ${order.address.city || ''}, ${order.address.province || ''} ${order.address.postalCode || ''}`;
        } else if (order.address.firstName) {
          // Format: { firstName, lastName, address, ... }
          formattedAddress = `${order.address.address || ''}, ${order.address.city || ''}, ${order.address.province || ''}`;
        }
      }
    }

    // Email content with improved UI
    const mailOptions = {
      from: '"SheMart" <noreply@shemart.com>',
      to: user.email,
      subject: "Order Confirmation - SheMart",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <!-- Header with Logo -->
          <div style="background-color: #f06292; padding: 25px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Order!</h1>
            <p style="color: white; margin-top: 5px; font-size: 16px;">Order #${order._id.toString().slice(-8)}</p>
          </div>
          
          <!-- Order Status -->
          <div style="background-color: #f8f8f8; padding: 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <p style="margin: 0; font-size: 16px; color: #333;">
              Your order has been <span style="font-weight: bold; color: #4caf50;">confirmed</span> and is being processed.
            </p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 25px; background-color: white;">
            <!-- Order Details -->
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 20px; margin-top: 0; border-bottom: 2px solid #f06292; padding-bottom: 8px; display: inline-block;">Order Details</h2>
              <div style="display: flex; flex-wrap: wrap; margin-top: 15px;">
                <div style="flex: 1; min-width: 200px; margin-bottom: 15px;">
                  <p style="margin: 5px 0; color: #666;">Order Date:</p>
                  <p style="margin: 5px 0; font-weight: bold;">${new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div style="flex: 1; min-width: 200px; margin-bottom: 15px;">
                  <p style="margin: 5px 0; color: #666;">Payment Method:</p>
                  <p style="margin: 5px 0; font-weight: bold;">${order.paymentMethod}</p>
                </div>
                <div style="flex: 1; min-width: 200px; margin-bottom: 15px;">
                  <p style="margin: 5px 0; color: #666;">Payment Status:</p>
                  <p style="margin: 5px 0; font-weight: bold;">${order.payment ? 'Paid' : 'Pending'}</p>
                </div>
              </div>
            </div>
            
            <!-- Shipping Address -->
            <div style="margin-bottom: 25px; padding: 15px; background-color: #f9f9f9; border-radius: 6px;">
              <h2 style="color: #333; font-size: 20px; margin-top: 0; margin-bottom: 15px;">Shipping Address</h2>
              <p style="margin: 5px 0; line-height: 1.5;">${formattedAddress}</p>
            </div>
            
            <!-- Items Ordered -->
            <div style="margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 20px; margin-top: 0; border-bottom: 2px solid #f06292; padding-bottom: 8px; display: inline-block;">Items Ordered</h2>
              <div style="margin-top: 15px; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f06292; color: white;">
                      <th style="padding: 12px; text-align: left;">Product</th>
                      <th style="padding: 12px; text-align: left;">Size</th>
                      <th style="padding: 12px; text-align: center;">Quantity</th>
                      <th style="padding: 12px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsList}
                    <tr style="background-color: #f9f9f9; font-weight: bold;">
                      <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #e0e0e0;">Total:</td>
                      <td style="padding: 12px; text-align: right; border-top: 2px solid #e0e0e0;">Rs. ${order.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Thank You Message -->
            <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 6px; text-align: center;">
              <p style="margin: 0; font-size: 16px;">Thank you for shopping with SheMart. If you have any questions about your order, please contact our customer service.</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} SheMart. All rights reserved.</p>
            <div>
              <a href="#" style="color: white; text-decoration: none; margin: 0 10px;">Contact Us</a>
              <a href="#" style="color: white; text-decoration: none; margin: 0 10px;">Return Policy</a>
              <a href="#" style="color: white; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
            </div>
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
