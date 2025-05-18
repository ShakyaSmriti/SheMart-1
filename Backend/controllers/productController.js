import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import productModel from "../models/ProductModel.js";

// Function for add product
const addProduct = async (req, res) => {
  try {
    console.log("Add product request received");
    console.log("Request body:", req.body);
    console.log("Files:", req.files);

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can add products",
      });
    }

    const {
      name,
      description,
      price,
      stock,
      category,
      subCategory,
      bestseller,
      sizes,
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let parsedSizes = sizes;
    if (typeof sizes === "string") {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (error) {
        console.error("Error parsing sizes:", error);
        return res.status(400).json({
          success: false,
          message: "Invalid sizes format",
        });
      }
    }

    let imageUrls = [];
    let videoUrls = [];

    if (req.files && req.files.image) {
      const imageFile = Array.isArray(req.files.image)
        ? req.files.image
        : [req.files.image];

      for (const file of imageFile) {
        try {
          const imagePath = `/uploads/${Date.now()}-${file.name}`;
          await file.mv(`./public${imagePath}`);
          imageUrls.push(imagePath);
        } catch (error) {
          console.error("Error uploading image:", error);
          return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: error.message,
          });
        }
      }
    }

    if (req.files && req.files.video) {
      const videoFile = Array.isArray(req.files.video)
        ? req.files.video
        : [req.files.video];

      for (const file of videoFile) {
        try {
          const videoPath = `/uploads/${Date.now()}-${file.name}`;
          await file.mv(`./public${videoPath}`);
          videoUrls.push(videoPath);
        } catch (error) {
          console.error("Error uploading video:", error);
          return res.status(500).json({
            success: false,
            message: "Error uploading video",
            error: error.message,
          });
        }
      }
    }

    const newProduct = new productModel({
      name,
      description,
      price,
      stock: stock || 10,
      category,
      subCategory: subCategory || "",
      bestseller: bestseller === "true" || bestseller === true,
      sizes: parsedSizes || [],
      image: imageUrls,
      video: videoUrls,
      date: Date.now(),
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      success: false,
      message: "Error adding product",
      error: error.message,
    });
  }
};

// Function for get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Function for get product by ID with validation
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// Function for update product with validation
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const updates = req.body;

    const product = await productModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// Function for remove product with validation
const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await productModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({
      success: false,
      message: "Error removing product",
      error: error.message,
    });
  }
};

export {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  removeProduct,
};
