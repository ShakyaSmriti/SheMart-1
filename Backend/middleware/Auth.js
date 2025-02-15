import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, msg: "Access denied. No token provided." });
  }
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: token_decode.id }; // Assuming token_decode contains userId
    // console.log(req.user);

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, msg: "Invalid token" });
  }
};

export default authUser;
