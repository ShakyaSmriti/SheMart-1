import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  let token;

  // Extract token from Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Fallback to custom token header
  if (!token) {
    token = req.headers.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, msg: "Access denied. No token provided." });
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: token_decode.id }; // Attach user ID to req.user
    console.log("Authenticated User:", req.user);
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, msg: "Invalid token" });
  }
};

export default authUser;
