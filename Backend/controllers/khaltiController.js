import axios from "axios";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";

dotenv.config();

// Initiate Khalti payment
export const initiatePayment = async (req, res) => {
  try {
    const {
      return_url,
      website_url,
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info,
      orderData,
    } = req.body;

    // Store orderData in session for later retrieval
    req.session.orderData = orderData;
    req.session.purchase_order_id = purchase_order_id;
    
    // Force session save to ensure data is stored immediately
    req.session.save(err => {
      if (err) {
        console.error("Error saving session:", err);
      } else {
        console.log("Session saved successfully with orderData:", req.session.orderData);
      }
    });

    const payload = {
      return_url,
      website_url,
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info,
    };

    console.log("Initiating Khalti payment with payload:", payload);

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      payload,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Khalti response:", response.data);
    return res.json(response.data);
  } catch (error) {
    console.error(
      "Khalti initiate payment error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: error.response?.data || error.message,
    });
  }
};

// Verify Khalti payment
export const verifyPayment = async (req, res) => {
  try {
    // Handle both GET and POST requests
    let pidx;
    if (req.method === 'GET') {
      // For GET requests, get pidx from query parameters
      pidx = req.query.pidx;
    } else {
      // For POST requests, get pidx from request body
      pidx = req.body.pidx;
    }
    
    const userId = req.user?.id;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Missing pidx",
      });
    }

    console.log("Verifying Khalti payment with pidx:", pidx);
    console.log("Session data:", req.session);

    // Verify payment with Khalti
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = response.data;
    console.log("Khalti verification response:", paymentData);

    // Get order data from session or request body (fallback)
    const orderData = req.session.orderData || req.body.orderData;
    console.log("Order data from session or request:", orderData);

    if (!orderData) {
      // If both session data and fallback are missing, return error
      return res.status(400).json({
        success: false,
        message: "Order data not found in session or request. Please try again.",
        sessionId: req.sessionID,
        sessionExists: !!req.session
      });
    }

    if (paymentData.status === "Completed") {
      // Create order in database
      const newOrder = new orderModel({
        userId,
        items: orderData.items,
        amount: orderData.amount,
        paymentMethod: "Khalti",
        address: orderData.address,
        payment: true,
        date: Date.now(),
        transactionId: pidx,
      });

      await newOrder.save();

      // Clear session data
      delete req.session.orderData;
      delete req.session.purchase_order_id;
      
      // Save session changes
      req.session.save();

      return res.json({
        success: true,
        message: "Payment verified and order created successfully",
        order: newOrder,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Payment verification failed: ${paymentData.status}`,
      });
    }
  } catch (error) {
    console.error(
      "Khalti verify payment error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.response?.data || error.message,
    });
  }
};
