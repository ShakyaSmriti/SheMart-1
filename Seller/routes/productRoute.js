import express from "express";

import {
  listProduct,
  addProduct,
  removeProduct,
  singleProduct,
  updateProduct,
  manageStock,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  addProduct
);

productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProduct);
productRouter.put(
  "/update/:id",
  adminAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  updateProduct
);

productRouter.put("/manage-stock", manageStock);

export default productRouter;
