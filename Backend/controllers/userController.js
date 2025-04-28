import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";

// JWT Token creation function
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// User login route
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

// User registration route
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, gender } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password should be at least 8 characters long.",
        });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match." });
    }

    const allowedGenders = ["Male", "Female", "Other"];
    if (!allowedGenders.includes(gender)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid gender. Please select Male, Female, or Other.",
        });
    }

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

// Admin login route
const adminLogin = async (req, res) => {
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
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials." });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all users route
const allUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    return res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user route
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Forget password mail route
const forgetPasswordMail = async (req, res) => {
  const { email } = req.body;

  try {
    const oldUser = await userModel.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    }

    const secret = process.env.JWT_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "1h",
    });

    const link = `http://localhost:4001/api/user/reset-password/${oldUser._id}/${token}`;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "shakyasmriti368@gmail.com",
        pass: "uqjr khpg yxya lsfv",
      },
    });

    var mailOptions = {
      from: "Sender123@gmail.com",
      to: email,
      subject: "Password Reset",
      text: `Click here to reset your password: ${link}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Email Error:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    console.log("Reset Link:", link);

    return res.json({ success: true, message: "Password reset email sent!" });
  } catch (error) {
    console.error("Forget Password Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reset password page route
const resetpasswordget = async (req, res) => {
  const { id, token } = req.params;

  const oldUser = await userModel.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }

  const secret = process.env.JWT_SECRET + oldUser.password;

  try {
    const verify = jwt.verify(token, secret);
    res.render("index", { email: verify.email, status: "Not Verified" });
  } catch (error) {
    res.send("Not Verified");
  }
};

// Reset password route
const resetpassword = async (req, res) => {
  const { id, token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });
  }

  const oldUser = await userModel.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }

  const secret = process.env.JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await userModel.updateOne(
      { _id: id },
      { $set: { password: encryptedPassword } }
    );

    res.render("index", { email: verify.email, status: "verified" });
  } catch (error) {
    res.json({ status: "Something Went Wrong" });
  }
};

// Get user profile route
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user profile route
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, gender, address, phone, dateOfBirth } = req.body;

    const formattedDateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        gender,
        address,
        phone,
        dateOfBirth: formattedDateOfBirth,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  allUsers,
  deleteUser,
  forgetPasswordMail,
  resetpasswordget,
  resetpassword,
  getProfile,
  updateUserProfile,
};
