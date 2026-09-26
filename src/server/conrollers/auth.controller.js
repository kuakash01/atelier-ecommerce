const sendEmail = require("../config/mailer");
const Users = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Cart = require("../models/cart.model");
const CartItem = require("../models/cartItem.model");


const otpStore = {};


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ status: "failed", message: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await Users.findOne({ email: cleanEmail });
    const isNewUser = !existingUser;

    const otp = generateOTP();
    otpStore[cleanEmail] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };
    console.log(`🔑 [DEV AUTH] OTP generated for ${cleanEmail}: ${otp} (isNewUser: ${isNewUser})`);

    res.json({ 
      status: "success", 
      message: "OTP sent to email", 
      isNewUser 
    });

    sendEmail({
      to: cleanEmail,
      subject: isNewUser ? "Welcome to Atelier - Activate Your VIP Account" : "Atelier & Co. - Sign-In Passcode",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <title>${isNewUser ? "Welcome to Atelier" : "Sign In to Atelier"}</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, sans-serif;
    }

    .container {
      width: 100%;
      padding: 30px 15px;
      background-color: #f4f6f8;
    }

    .card {
      max-width: 500px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    }

    .logo {
      text-align: center;
      margin-bottom: 20px;
      font-size: 22px;
      font-weight: bold;
      color: #4f46e5;
    }

    .title {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 10px;
      text-align: center;
    }

    .subtitle {
      font-size: 14px;
      color: #6b7280;
      text-align: center;
      margin-bottom: 25px;
      line-height: 1.5;
    }

    .otp-box {
      background: #f9fafb;
      border: 2px dashed #4f46e5;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #4f46e5;
      margin-bottom: 25px;
    }

    .info {
      font-size: 13px;
      color: #6b7280;
      text-align: center;
      line-height: 1.5;
      margin-bottom: 25px;
    }

    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 15px;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    }

    .brand {
      font-weight: 600;
      color: #4f46e5;
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="card">

      <div class="logo">
        ✨ ATELIER & CO.
      </div>

      <div class="title">
        ${isNewUser ? "Welcome to Atelier & Co." : "Sign In to Your Account"}
      </div>

      <div class="subtitle">
        ${isNewUser 
          ? "Use the single-use passcode below to activate your account and start exploring our collections." 
          : "Use the single-use passcode below to securely sign in to your Atelier account."}
      </div>

      <div class="otp-box">
        ${otp}
      </div>

      <div class="info">
        This OTP is valid for <strong>5 minutes</strong>.<br/>
        Please do not share this code with anyone.
      </div>

      <div class="footer">
        If you didn’t request this, you can safely ignore this email.<br/>
        © ${new Date().getFullYear()} <span class="brand">YourStore</span>. All rights reserved.
      </div>

    </div>

  </div>

</body>
</html>
`

    }).catch(err => console.log("Mail failed:", err));

  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ status: "failed", message: "Failed to send OTP" });
  }
};


const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: "failed",
        message: "Email and OTP required"
      });
    }

    const stored = otpStore[email];

    if (!stored) {
      return res.status(400).json({
        status: "failed",
        message: "OTP expired or not sent"
      });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid OTP"
      });
    }

    if (stored.expiresAt < Date.now()) {
      delete otpStore[email];
      return res.status(400).json({
        status: "failed",
        message: "OTP expired"
      });
    }

    // Remove OTP
    delete otpStore[email];

    // Find user
    let user = await Users.findOne({ email });
    const isNewUser = !user;

    // Create user if not exists
    if (!user) {
      user = await Users.create({
        name: `user-${Date.now()}`,
        email,
        role: "customer",
        tokens: []
      });
    }

    /* ===============================
       🧹 CLEAN EXPIRED TOKENS HERE
       =============================== */

    const originalLength = user.tokens.length;

    user.tokens = user.tokens.filter(token => {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        return true; // keep valid
      } catch {
        return false; // remove expired
      }
    });

    // Save only if something removed
    if (user.tokens.length !== originalLength) {
      await user.save();
    }

    /* ===============================
       🔐 CREATE NEW TOKEN
       =============================== */

    const newToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Store token
    user.tokens.push(newToken);
    await user.save();

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("user_token", newToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      status: "success",
      message: isNewUser ? "Welcome to Atelier! VIP account created." : "Welcome back!",
      isNewUser,
      email,
      name: user.name,
      token: newToken
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      status: "failed",
      message: "Internal server error"
    });
  }
};

const checkAuth = async (req, res) => {
  const { email } = req.user;
  // res.status(200).json({ email });
  try {
    let isAuthenticated = false;
    const FindUser = await Users.findOne({ email });
    if (!FindUser) return res.status(404).json({ status: "failed", message: "user not found", });

    // Find cart
    const cart = await Cart.findOne({ user: FindUser._id });

    let cartCount = 0;


    // If cart exists → count items
    if (cart) {

      const result = await CartItem.aggregate([
        {
          $match: { cart: cart._id }
        },
        {
          $group: {
            _id: null,
            totalQty: { $sum: "$quantity" }
          }
        }
      ]);

      cartCount = result[0]?.totalQty || 0;
    }


    isAuthenticated = true;
    let userData = {
      name: FindUser.name,
      email: req.user.email,
      role: req.user.role,
      profilePicture: FindUser.profilePicture,
      cartCount
    }
    res.status(200).json({
      status: "success",
      message: "Authenticated",
      data: { isAuthenticated, userData } // This will contain the decoded JWT payload
    });


  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ status: "failed", message: "error in user authentication" })
  }
}

const sendRegisterOtp = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ status: "failed", message: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if account already exists
    const existingUser = await Users.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        status: "failed",
        message: "An account with this email already exists. Please sign in instead.",
      });
    }

    const otp = generateOTP();
    otpStore[cleanEmail] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      type: "registration",
    };

    console.log(`🔑 [DEV REGISTRATION] OTP generated for ${cleanEmail}: ${otp}`);

    res.json({
      status: "success",
      message: "Verification code sent to your email inbox.",
    });

    sendEmail({
      to: cleanEmail,
      subject: "Atelier & Co. - Verify Your Email to Complete Registration",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email - Atelier & Co.</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, sans-serif; }
    .container { width: 100%; padding: 30px 15px; background-color: #f4f6f8; }
    .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
    .logo { text-align: center; margin-bottom: 20px; font-size: 22px; font-weight: bold; color: #4f46e5; }
    .title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 10px; text-align: center; }
    .subtitle { font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 25px; line-height: 1.5; }
    .otp-box { background: #f9fafb; border: 2px dashed #4f46e5; border-radius: 10px; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; margin-bottom: 25px; }
    .info { font-size: 13px; color: #6b7280; text-align: center; line-height: 1.5; margin-bottom: 25px; }
    .footer { border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 12px; color: #9ca3af; text-align: center; }
    .brand { font-weight: 600; color: #4f46e5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">✨ ATELIER & CO.</div>
      <div class="title">Verify Your Email Address</div>
      <div class="subtitle">
        Hello${name ? ` ${name}` : ""}, thank you for registering with Atelier & Co. Use the single-use verification passcode below to complete your registration.
      </div>
      <div class="otp-box">${otp}</div>
      <div class="info">
        This verification code is valid for <strong>5 minutes</strong>.<br/>
        Please do not share this passcode with anyone.
      </div>
      <div class="footer">
        If you did not attempt to register an account, please disregard this email.<br/>
        © ${new Date().getFullYear()} <span class="brand">Atelier & Co.</span>. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`,
    }).catch((err) => console.log("Mail failed:", err));
  } catch (error) {
    console.error("Send Register OTP Error:", error);
    return res.status(500).json({ status: "failed", message: "Failed to send registration verification code" });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ status: "failed", message: "Full name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ status: "failed", message: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ status: "failed", message: "Password must be at least 6 characters" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify OTP for registration
    if (!otp || typeof otp !== "string" || !otp.trim()) {
      return res.status(400).json({
        status: "failed",
        message: "6-digit email verification code is required.",
      });
    }

    const stored = otpStore[cleanEmail];
    if (!stored) {
      return res.status(400).json({
        status: "failed",
        message: "Verification code expired or not requested. Please request a new code.",
      });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid verification code. Please check and try again.",
      });
    }

    if (stored.expiresAt < Date.now()) {
      delete otpStore[cleanEmail];
      return res.status(400).json({
        status: "failed",
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // Remove OTP once verified
    delete otpStore[cleanEmail];

    // Double check if account exists
    const existing = await Users.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        status: "failed",
        message: "Account with this email already exists. Please sign in.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Users.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "customer",
      tokens: [],
    });

    const newToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    user.tokens.push(newToken);
    await user.save();

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("user_token", newToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({
      status: "success",
      message: "Account verified and created successfully! Welcome to Atelier.",
      token: newToken,
      userData: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        cartCount: 0,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ status: "failed", message: "Registration failed. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "failed", message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await Users.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ status: "failed", message: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(400).json({ 
        status: "failed", 
        message: "This account was registered via OTP. Please sign in using the Passcode OTP tab." 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ status: "failed", message: "Invalid email or password" });
    }

    // Clean expired tokens
    user.tokens = (user.tokens || []).filter(token => {
      try {
        jwt.verify(token, process.env.JWT_SECRET);
        return true;
      } catch {
        return false;
      }
    });

    const newToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    user.tokens.push(newToken);
    await user.save();

    // Find cart count
    const cart = await Cart.findOne({ user: user._id });
    let cartCount = 0;
    if (cart) {
      const result = await CartItem.aggregate([
        { $match: { cart: cart._id } },
        { $group: { _id: null, totalQty: { $sum: "$quantity" } } }
      ]);
      cartCount = result[0]?.totalQty || 0;
    }

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("user_token", newToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      status: "success",
      message: "Signed in successfully!",
      token: newToken,
      userData: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        cartCount
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ status: "failed", message: "Sign in failed. Please try again." });
  }
};

const signout = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.token;
    await Users.findByIdAndUpdate(userId, { $pull: { tokens: token } });

    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("user_token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({ status: "success", message: "Logged out successfully", data: { isAuthentcated: false, userData: null } });
  } catch (err) {
    res.status(500).json({ status: "failed", message: "Server Error", error: err.message });
  }
}

module.exports = {
  checkAuth,
  sendOtp,
  verifyOtp,
  sendRegisterOtp,
  register,
  login,
  signout,
};