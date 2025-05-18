// routes/productRoute.js
import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  removeProduct,
  manageStock,
} from "../controllers/productController.js";
import { verifyToken } from "../middleware/Auth.js"; // Fixed import path
import upload from "../middleware/multer.js";

const router = express.Router();

// Public routes
router.get("/all", getAllProducts);
router.get("/:id", getProductById);

// Protected routes (require token)
router.post(
  "/add",
  verifyToken,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  addProduct
);

router.put(
  "/update/:id",
  verifyToken,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  updateProduct
);
router.post("/delete", verifyToken, removeProduct);

router.put("/manage-stock", manageStock);

export default router;
