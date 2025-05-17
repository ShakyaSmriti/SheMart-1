import { v2 as cloudinary } from "cloudinary";
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
      bestseller,
    } = req.body;

    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Required fields: name, description, price, and category.",
      });
    }

    // Check if req.files exists
    if (!req.files) {
      console.log("No files were uploaded");
      req.files = { image: [], video: [] };
    }

    // if only image[0] or video[o] has image than store in image otherwise ignore
    const image = req.files.image && req.files?.image?.[0];
    const video = req.files.video && req.files?.video?.[0];

    console.log("Image file:", image);
    console.log("Video file:", video);

    // uploading images and video in cloudinary to store in mongoodb
    const images = image ? [image] : [];
    const videos = video ? [video] : [];

    let imagesUrl = [];
    let videoUrl = [];

    try {
      if (images.length > 0) {
        imagesUrl = await Promise.all(
          images.map(async (item) => {
            console.log("Uploading image:", item.path);
            let result = await cloudinary.uploader.upload(item.path, {
              resource_type: "image",
            });
            console.log("Cloudinary image result:", result);
            return result.secure_url;
          })
        );
      }

      if (videos.length > 0) {
        videoUrl = await Promise.all(
          videos.map(async (item) => {
            console.log("Uploading video:", item.path);
            let result = await cloudinary.uploader.upload(item.path, {
              resource_type: "video",
            });
            console.log("Cloudinary video result:", result);
            return result.secure_url;
          })
        );
      }
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      return res.status(500).json({
        success: false,
        message: "Error uploading files to Cloudinary",
        error: cloudinaryError.message,
      });
    }

    console.log("Images URL:", imagesUrl);
    console.log("Videos URL:", videoUrl);

    // Saving data in mongodb
    try {
      const productData = {
        name,
        description,
        category,
        price: Number(price),
        subCategory,
        bestseller: bestseller === "true" ? true : false,
        sizes: JSON.parse(sizes),
        image: imagesUrl,
        video: videoUrl,
        date: Date.now(),
      };

      console.log("Product data to save:", productData);

      const product = new productModel(productData);
      await product.save();

      res.status(201).json({
        success: true,
        message: "Product added successfully.",
      });
    } catch (dbError) {
      console.error("Database save error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Error saving product to database",
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected server error occurred.",
      error: error.message,
      stack: error.stack,
    });
  }
};

//*function for update product
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

//function for list Product
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//function for remove Product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//function for asingle Product
const singleProduct = async (req, res) => {
  try {
    const { productID } = req.body;
    const product = await productModel.findById(productID);
    // console.log(product);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { listProduct, addProduct, removeProduct, singleProduct, updateProduct };
