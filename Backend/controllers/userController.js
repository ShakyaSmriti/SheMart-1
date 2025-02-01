import validator from "validator";
import bcrypt from "bcrypt"; // Fixed typo: "bycrpt" to "bcrypt"
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js"; // Ensure the path includes ".js"

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in the database
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(200) // Still return 200 to avoid "400 Bad Request" from frontend
        .json({ success: false, message: "Invalid Email or Password" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(200) // Same here
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

// Router for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, gender } = req.body;
    console.log(req.body);

    // console.log(req.body);

    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email." });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 8 characters long.",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Validate gender
    const allowedGenders = ["Male", "Female", "Other"];
    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender. Please select Male, Female, or Other.",
      });
    }

    // Proceed with registration if validations pass
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      gender,
    });

    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Router for admin login
const adminLogin = async (req, res) => {
  // Implement admin login functionality
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.status(200).json({
        success: true,
        message: "Admin logged in successfully.",
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials.",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export { loginUser, registerUser, adminLogin };
