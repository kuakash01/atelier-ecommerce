// scripts/createAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

mongoose.connect("mongodb+srv://kuakash04:itsmeakash@cluster0.44juevl.mongodb.net/ecom?retryWrites=true&w=majority&appName=Cluster0");

async function createAdmin() {
  const existing = await User.findOne({ email: "admin@gmail.com" });
  const hashed = await bcrypt.hash("@Test123", 10);

  if (existing) {
    existing.password = hashed;
    await existing.save();
    console.log("Admin already existed - updated password successfully");
    mongoose.disconnect();
    return;
  }

  const admin = new User({ name: "admin", email: "admin@gmail.com", password: hashed, role: "admin" });
  await admin.save();
  console.log("Admin created");
  mongoose.disconnect();
}

createAdmin();
