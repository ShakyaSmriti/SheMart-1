import express from "express";

import { addReview, getReviews } from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/Auth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add/:productId", verifyToken, addReview); // Add review to a product
reviewRouter.get("/list/:productId", getReviews); // Get reviews for a product

export default reviewRouter;
