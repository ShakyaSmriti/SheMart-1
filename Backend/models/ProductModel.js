import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  sizes: { type: Array, required: true },
  image: { type: Array, required: true },
  video: { type: Array, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  bestseller: { type: Boolean },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  date: { type: Number, required: true },
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
