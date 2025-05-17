import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import wishlistRouter from "./routes/wishlistRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import khaltiRouter from "./routes/khaltiRoute.js";
import session from "express-session";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Log Cloudinary configuration to verify it's correct
console.log("Cloudinary Configuration:", {
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: "********" // Don't log the actual secret
});

// App Config
const app = express();
const port = process.env.PORT || 4001;
connectDB();
connectCloudinary();

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middlewares
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

// Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'khalti-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/review", reviewRouter);
app.use("/api/khalti", khaltiRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => console.log("\nServer started on PORT:" + port));
