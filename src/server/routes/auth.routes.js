const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const {
  checkAuth,
  sendOtp,
  verifyOtp,
  register,
  sendRegisterOtp,
  login,
  signout,
} = require("../conrollers/auth.controller");

router.get("/me", verifyToken, checkAuth);
router.post("/register", register);
router.post("/register-otp", sendRegisterOtp);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/signout", verifyToken, signout);

module.exports = router;