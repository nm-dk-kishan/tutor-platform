
import { randomUUID } from "node:crypto";
import path from "node:path";
import cloudinary from "../config/cloudinary.js";

// Upload one validated PDF file to Cloudinary.
export const uploadAssignmentPdf = (file, folder = "assignments") => {
  return new Promise((resolve, reject) => {
    // Make a safe version of the original filename.
    const originalName = path.parse(file.originalname).name;

    const safeName =
      originalName
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "assignment-file";

    // Generate a unique ID to avoid filename collisions.
    // Raw Cloudinary assets use the file extension in their public ID.
    const publicId = `tutor/${folder}/${randomUUID()}-${safeName}.pdf`;

    // Stream the PDF buffer to Cloudinary.
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result?.secure_url || !result?.public_id) {
          return reject(
            new Error("Cloudinary did not return the uploaded file details.")
          );
        }

        // Return metadata matching the tutor attachment schema.
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          fileName: path.basename(file.originalname),
          fileType: "application/pdf",
          fileSize: result.bytes ?? file.size,
        });
      }
    );

    // Send the in-memory file buffer to Cloudinary.
    uploadStream.end(file.buffer);
  });
};

// Delete a previously uploaded raw PDF.
// Useful if saving its database record fails.
export const deleteAssignmentPdf = async (publicId) => {
  if (!publicId) {
    return;
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
    invalidate: true,
  });

  // Do not silently treat an unsuccessful deletion as success.
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(
      `Cloudinary file cleanup failed: ${result.result}`
    );
  }

  return result;
};
