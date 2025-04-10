import express from "express";

import { addWishlist, getWishlist } from "../controllers/wishlistController.js";
import authUser from "../middleware/Auth.js";

const wishlistRouter = express.Router();

export default wishlistRouter;

wishlistRouter.post("/add", authUser, addWishlist);
wishlistRouter.get("/get", authUser, getWishlist);
