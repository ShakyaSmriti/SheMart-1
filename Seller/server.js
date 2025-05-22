import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import wishlistRouter from "./routes/whislistRoute.js";
import reviewRouter from "./routes/reviewRoute.js";

// Ensure environment variables are loaded
dotenv.config();

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App Config
const app = express();
const port = process.env.PORT || 4001;
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/review", reviewRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => console.log("\nServer started on PORT:" + port));
