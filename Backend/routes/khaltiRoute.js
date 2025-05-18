import express from "express";
import { initiatePayment, verifyPayment } from "../controllers/khaltiController.js";
import { verifyToken } from "../middleware/Auth.js";

const router = express.Router();

// Initiate Khalti payment
router.post("/initiate", verifyToken, initiatePayment);

// Verify Khalti payment - support both POST and GET
router.post("/verify", verifyToken, verifyPayment);
router.get("/verify", verifyToken, verifyPayment);

export default router;
