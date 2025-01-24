import jwt from "jsonwebtoken";

const adminAuth = async (req, resizeBy, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ status: false, message: "Access denied" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res.json({ status: false, message: "Access denied" });
    }
    next();
  } catch (error) {
    console.log(error);
    next({ status: 401, message: "Access denied" });
  }
};

export default adminAuth;
