// routes/productRoute.js
import express from "express";
import { 
  addProduct, 
  getAllProducts, 
  getProductById,
  updateProduct,
  removeProduct
} from "../controllers/productController.js";
import { verifyToken } from "../middleware/Auth.js";  // Fixed import path

const router = express.Router();

// Public routes
router.get("/all", getAllProducts);
router.get("/:id", getProductById);

// Protected routes (require token)
router.post("/add", verifyToken, addProduct);
router.put("/update/:id", verifyToken, updateProduct);
router.delete("/delete/:id", verifyToken, removeProduct);

export default router;
