import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import productModel from "../models/ProductModel.js";

//function for add product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      stock,
      bestseller,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !sizes) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields: name, description, price, category, and sizes.",
      });
    }

    // Extract image and video from req.files safely
    const imageFile = req?.files?.image?.[0];
    const videoFile = req?.files?.video?.[0];

    // Upload image if provided
    const imagesUrl = imageFile
      ? [
          await cloudinary.uploader
            .upload(imageFile.path, {
              resource_type: "image",
            })
            .then((res) => res.secure_url),
        ]
      : [];

    // Upload video if provided
    const videoUrl = videoFile
      ? [
          await cloudinary.uploader
            .upload(videoFile.path, {
              resource_type: "video",
            })
            .then((res) => res.secure_url),
        ]
      : [];

    // Parse sizes if it's a JSON string
    let parsedSizes;
    try {
      parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      if (!Array.isArray(parsedSizes)) throw new Error();
    } catch {
      return res.status(400).json({
        success: false,
        message: "Sizes must be a valid JSON array.",
      });
    }

    // Construct product object
    const productData = {
      name,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      subCategory: subCategory || "",
      bestseller: bestseller === "true" || bestseller === true,
      sizes: parsedSizes,
      image: imagesUrl,
      video: videoUrl,
      date: new Date(),
    };

    // Save product
    const product = new productModel(productData);
    await product.save();

  } catch (error) {
    console.error("Error in addProduct:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected server error occurred.",
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
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      stock,
    } = req.body;

    console.log("Product Id:", req.params);
    console.log("Request Body:", req.body);

    // Fetch the existing product
    const product = await productModel.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const updateFields = {};

    if (name) updateFields.name = name;
    if (description) updateFields.description = description;
    if (price) updateFields.price = Number(price);
    if (stock) updateFields.stock = Number(stock);
    if (category) updateFields.category = category;
    if (subCategory) updateFields.subCategory = subCategory;
    if (sizes) updateFields.sizes = JSON.parse(sizes);
    if (bestseller !== undefined)
      updateFields.bestseller = bestseller === "true";

    // Handle image and video uploads if files are provided
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    const images = [imageFile].filter((item) => item !== undefined);
    const videos = [videoFile].filter((item) => item !== undefined);

    if (images.length > 0) {
      const uploadedImages = await Promise.all(
        images.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {
            folder: "products/images",
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
      updateFields.image = [...(product.image || []), ...uploadedImages];
    }

    if (videos.length > 0) {
      const uploadedVideos = await Promise.all(
        videos.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {
            folder: "products/videos",
            resource_type: "video",
          });
          return result.secure_url;
        })
      );
      updateFields.video = [...(product.video || []), ...uploadedVideos];
    }

    // Update product only with modified fields
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({
      success: false,
      message: "An unexpected server error occurred.",
      error: error.message,
    });
  }
};

// Function for remove product with validation
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function to manage stock levels in real time (increase or decrease)
const manageStock = async (req, res) => {
  try {
    const { productId, newQuantity, prevQuantity = 0 } = req.body;

    // Calculate quantity difference (new - old)
    const quantityDiff = newQuantity - prevQuantity;

    // If quantityDiff is 0, no stock change is needed
    if (quantityDiff === 0) {
      return res.status(200).json({
        success: true,
        message: "No stock change needed",
      });
    }

    const stockChange = -quantityDiff; // Opposite direction of quantity change

    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      { $inc: { stock: stockChange } },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product: updatedProduct,
    });

  } catch (error) {
    console.error("Error managing stock:", error.message);
    res.status(500).json({
      success: false,
      message: "An unexpected server error occurred.",
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
  manageStock,
};
