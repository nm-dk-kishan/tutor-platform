
import multer from "multer";
import path from "node:path";

// Maximum size allowed for each PDF: 10 MB.
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Configure Multer to temporarily store files in memory.
const upload = multer({
  storage: multer.memoryStorage(),

  // Limit file size and the number of files per request.
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 3,
  },

  // Only accept files that claim to be PDFs.
  fileFilter: (req, file, callback) => {
    const extension = path
      .extname(file.originalname || "")
      .toLowerCase();

    if (
      extension !== ".pdf" ||
      file.mimetype !== "application/pdf"
    ) {
      return callback(
        new Error("Only PDF files are allowed.")
      );
    }

    callback(null, true);
  },
});

// Middleware used by assignment creation and submission routes.
export const uploadAssignmentFiles = (req, res, next) => {
  // Expect uploaded files under the field name "attachments".
  upload.array("attachments", 3)(req, res, (error) => {
    if (error) {
      // Handle Multer file-size and file-count errors.
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            message: "Each PDF must be 10 MB or smaller.",
          });
        }

        if (
          error.code === "LIMIT_FILE_COUNT" ||
          error.code === "LIMIT_UNEXPECTED_FILE"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Upload up to 3 PDF files using the attachments field.",
          });
        }

        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // Handle files rejected by our PDF filter.
      return res.status(400).json({
        success: false,
        message: error.message || "Invalid file upload.",
      });
    }

    // Check the actual PDF file signature, not only its extension.
    const files = req.files || [];

    const invalidPdf = files.some((file) => {
      return (
        !file.buffer ||
        file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-"
      );
    });

    if (invalidPdf) {
      return res.status(400).json({
        success: false,
        message: "One or more files are not valid PDFs.",
      });
    }

    // Continue to the controller after validation.
    next();
  });
};
