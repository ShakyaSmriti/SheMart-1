import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded token:", decoded);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    req.user = {
      userId: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    // console.log("User ID found in token:", req.user.userId);

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

export default adminAuth;

/*

import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ status: false, message: "Access denied" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (
      token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD &&
      token_decode !== process.env.SELLER_EMAIL + process.env.SELLER_PASSWORD
    ) {
      return res.json({ status: false, message: "Access denied" });
    }
    next();
  } catch (error) {
    console.log(error);
    next({ status: 401, message: "Access denied" });
  }
};

export default adminAuth;

*/
