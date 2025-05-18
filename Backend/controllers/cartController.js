import productModel from "../models/ProductModel.js";
import userModel from "../models/userModel.js";

// Add products to user cart
const addToCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = req.user?.userId;

    if (!userId || !itemId || !size || quantity == null) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid required fields",
      });
    }

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be greater than 0" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    cartData[itemId][size] = (cartData[itemId][size] || 0) + quantity;

    await userModel.findByIdAndUpdate(userId, { cartData }, { new: true });

    res.json({ success: true, message: "Product added to cart", cartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update user cart
const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = req.user?.userId;

    // console.log("User ID from middleware:", userId);
    // console.log("Request Body:", req.body);

    if (!userId || !itemId || !size || quantity == null) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {}; // Ensure cartData exists

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }
    cartData[itemId][size] = quantity;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { cartData },
      { new: true }
    );

    res.json({
      success: true,
      message: "Cart updated",
      cartData: updatedUser.cartData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get user cart data
const getUserCart = async (req, res) => {
  try {
    const userId = req.user?.userId;
    // console.log(userId);

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {}; // Ensure cartData exists
    res.json({ success: true, cartData });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const restoreStockFromCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== "number") {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid productId or quantity",
      });
    }

    // Find the product first
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Add quantity back to stock
    product.stock = (product.stock || 0) + quantity;

    // Save updated product
    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock restored successfully",
      updatedStock: product.stock,
      product,
    });
  } catch (error) {
    console.error("Error restoring stock:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while restoring stock",
      error: error.message,
    });
  }
};

export { addToCart, updateCart, getUserCart, restoreStockFromCart };
