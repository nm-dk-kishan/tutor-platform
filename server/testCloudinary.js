
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Load environment variables from server/.env
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Check that all required settings exist
async function testCloudinary() {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary environment variables are missing.");
    }

    // Ask Cloudinary to verify the configured credentials
    const result = await cloudinary.api.ping();

    console.log("Cloudinary connection successful!");
    console.log("Response:", result);
  } catch (error) {
    console.error("Cloudinary connection failed:");
    console.error(error.message);
  }
}

testCloudinary();
