const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// const verifyToken = (req, res, next) => {
//   // Expect header: Authorization: "Bearer <token>"
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ error: "Unauthorized, token missing" });
//   }

//   // Extract token
//   const token = authHeader.split(' ')[1]; // "Bearer <token>"

//   if (!token) {
//     return res.status(401).json({ error: "Unauthorized, token missing" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // attach user info to request
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: "Invalid token" });
//   }
// };



// const verifyToken = async (req, res, next) => {
//   try {
//     // Expect header: Authorization: "Bearer <token>"
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//       return res.status(401).json({ error: "Unauthorized, token missing" });
//     }

//     // Extract token
//     const token = authHeader.split(' ')[1]; // "Bearer <token>"

//     if (!token) {
//       return res.status(401).json({ error: "Unauthorized, token missing" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findOne({
//       _id: decoded._id,
//       "tokens.token": token // 🔥 IMPORTANT
//     });

//     if (!user) {
//       return res.status(403).json({ error: "Invalid token" });
//     }

//     req.user = decoded; // attach user info to request
//     req.token = token;
//     next();
//   } catch (err) {
//     return res.status(403).json({ error: "Invalid token" });
//   }
// };


const verifyToken = async (req, res, next) => {
  try {
    const isApiAdmin =
      req.originalUrl?.includes("/admin") ||
      req.baseUrl?.includes("/admin") ||
      req.path?.includes("/admin");

    let token = null;

    if (isApiAdmin) {
      // Admin routes MUST use dedicated admin token
      token =
        req.cookies?.admin_token ||
        req.cookies?.adminToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    } else {
      // Storefront routes use user token
      token =
        req.cookies?.user_token ||
        req.cookies?.token ||
        req.header("Authorization")?.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        status: "failed",
        message: isApiAdmin
          ? "Unauthorized: Admin session token missing. Please sign in."
          : "Unauthorized: Token missing. Please sign in.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          status: "failed",
          message: "Session expired. Please log in again.",
        });
      }

      return res.status(401).json({
        success: false,
        status: "failed",
        message: "Invalid token.",
      });
    }

    // Verify token exists in database for this user
    const user = await User.findOne({
      _id: decoded.id,
      tokens: token,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        status: "failed",
        message: "Session revoked or account not found.",
      });
    }

    // Strictly enforce role === 'admin' for any admin route
    if (isApiAdmin && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        status: "failed",
        message: "Access forbidden: Admin privileges required.",
      });
    }

    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      status: "failed",
      message: "Authentication failed",
      error: err.message,
    });
  }
};

module.exports = verifyToken;