import express from "express";
import { initiatePayment, verifyPayment } from "../controllers/khaltiController.js";
import authUser from "../middleware/Auth.js";

const router = express.Router();

// Initiate Khalti payment
router.post("/initiate", authUser, initiatePayment);

// Verify Khalti payment
router.post("/verify", authUser, verifyPayment);

export default router;
