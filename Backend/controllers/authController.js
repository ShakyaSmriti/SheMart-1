import User from "../models/User.js";

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    // Check how the user ID is stored in the decoded token
    const userId = req.user.id || req.user.userId;
    
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server Error" 
    });
  }
};

export { getUserProfile };
