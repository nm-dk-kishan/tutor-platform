import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "admin@tutor.com";
    const password = "Admin123456";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name: "Tutor Admin",
      email,
      phone: "9999999999",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isActive: true,
    });

    console.log("Admin created successfully:");
    console.log("Email:", admin.email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  }
};

createAdmin();