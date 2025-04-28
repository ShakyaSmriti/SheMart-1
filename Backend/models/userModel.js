import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    cartData: { type: Object, default: {} },
    wishList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        default: [],
      },
    ],
    address: { type: String, default: "" }, // New field
    phone: { type: String, default: "" }, // New field
    dateOfBirth: { type: Date, default: null }, // New field
    profilePicture: { type: String, default: "" }, // New field
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
