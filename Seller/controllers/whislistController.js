import userModel from "../models/userModel.js";

// function to add wishlist product
const addWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user?.userId;

  // console.log(`Product Id${productId}`);

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User not authenticated" });
  }

  if (!productId) {
    return res
      .status(400)
      .json({ success: false, message: "Product ID is required" });
  }

  try {
    const userData = await userModel.findById(userId);

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Ensure wishList is an array
    if (!Array.isArray(userData.wishList)) {
      userData.wishList = [];
    }

    const alreadyAdded = userData.wishList.some(
      (id) => id.toString() === productId
    );

    const updateAction = alreadyAdded
      ? { $pull: { wishList: productId } }
      : { $set: { wishList: [...userData.wishList, productId] } }; // Ensures wishList remains an array

    const updatedUserData = await userModel.findByIdAndUpdate(
      userId,
      updateAction,
      { new: true }
    );

    res.json({
      success: true,
      message: alreadyAdded
        ? "Product removed from wishlist"
        : "Product added to wishlist",
      userData: updatedUserData,
    });
  } catch (err) {
    console.error("Error in addWishlist:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getWishlist = async (req, res) => {
  const userId = req.user?.userId;
  // console.log(`userId: ${userId}`);

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User not authenticated" });
  }

  try {
    const userData = await userModel.findById(userId).populate("wishList"); // ✅ Ensure Product model is registered

    // console.log(`userData: ${userData}`);

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, wishList: userData.wishList || [] });
  } catch (error) {
    console.error("Error in getWishlist:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { addWishlist, getWishlist };
