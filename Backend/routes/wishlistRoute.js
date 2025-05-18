import express from "express";

import { addWishlist, getWishlist } from "../controllers/wishlistController.js";
import { verifyToken } from "../middleware/Auth.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/add", verifyToken, addWishlist);
wishlistRouter.get("/get", verifyToken, getWishlist);

export default wishlistRouter;
