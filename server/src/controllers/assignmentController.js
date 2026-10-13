import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import TutorProfile from "../models/TutorProfile.js";
import TutorStudent from "../models/TutorStudent.js";
import User from "../models/User.js";

import {
  uploadAssignmentPdf,
  deleteAssignmentPdf,
} from "../utils/assignmentFileService.js";

// ==========================================
// CREATE ASSIGNMENT
// ==========================================

export const createAssignment = async (req, res) => {
  // Track every successfully uploaded PDF for cleanup if creation fails.
  const uploadedFiles = [];

  try {
    const { studentId, title, description, dueDate } = req.body;

    // Only tutors can create assignments.
    if (req.user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Only tutors can create assignments",
      });
    }

    // Validate required fields.
    if (!studentId || !title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Student, title and description are required",
      });
    }

    // Validate the optional due date.
    if (dueDate && Number.isNaN(Date.parse(dueDate))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid due date",
      });
    }

    // Find the logged-in tutor's profile.
    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Confirm the student has an active relationship with this tutor.
    const relationship = await TutorStudent.findOne({
      tutor: tutorProfile._id,
      student: studentId,
      status: "active",
    });

    if (!relationship) {
      return res.status(403).json({
        success: false,
        message: "You can only create assignments for your active students",
      });
    }

    // Confirm the selected account is a student.
    const student = await User.findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Upload attached PDFs to Cloudinary.
    for (const file of req.files || []) {
      const uploadedFile = await uploadAssignmentPdf(file, "assignments");

      // Save each successful upload for possible cleanup.
      uploadedFiles.push(uploadedFile);
    }

    // Create the assignment with its uploaded attachments.
    const assignment = await Assignment.create({
      tutor: tutorProfile._id,
      student: studentId,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      attachments: uploadedFiles,
    });

    // Database creation succeeded, so keep the uploaded files.
    uploadedFiles.length = 0;

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    // Delete uploaded PDFs if assignment creation fails.
    for (const file of uploadedFiles) {
      try {
        await deleteAssignmentPdf(file.publicId);
      } catch (cleanupError) {
        console.error("Assignment PDF cleanup error:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create assignment",
    });
  }
};

// ==========================================
// GET TUTOR ASSIGNMENTS
// ==========================================

export const getTutorAssignments = async (req, res) => {
  try {
    // Only tutors
    if (req.user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Only tutors can access these assignments",
      });
    }

    // Find tutor profile
    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Get assignments
    const assignments = await Assignment.find({
      tutor: tutorProfile._id,
    })
      .populate("student", "name email phone")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get tutor assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load assignments",
    });
  }
};

// ==========================================
// GET STUDENT ASSIGNMENTS
// ==========================================

export const getStudentAssignments = async (req, res) => {
  try {
    // Only students
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access their assignments",
      });
    }

    // Get student's assignments
    const assignments = await Assignment.find({
      student: req.user.userId,
    })
      .populate({
        path: "tutor",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get student assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load assignments",
    });
  }
};

// ==========================================
// SUBMIT ASSIGNMENT (STUDENT)
// ==========================================

export const submitAssignment = async (req, res) => {
  // Keep track of uploaded files for cleanup if saving fails.
  const uploadedFiles = [];

  try {
    const { assignmentId } = req.params;

    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

    // Only students can submit assignments.
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit assignments.",
      });
    }

    // Validate assignment ID.
    if (!mongoose.isValidObjectId(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    // Validate answer length.
    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Your answer cannot exceed 5000 characters.",
      });
    }

    // Students can only submit their own assignments.
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      student: req.user.userId,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found for this student.",
      });
    }

    // Reviewed assignments cannot be resubmitted.
    if (assignment.status === "reviewed" || assignment.review?.reviewedAt) {
      return res.status(400).json({
        success: false,
        message: "This assignment has already been reviewed.",
      });
    }

    const files = req.files || [];
    const existingAttachments = assignment.submission?.attachments || [];

    // Require an answer or a PDF.
    if (!text && files.length === 0 && existingAttachments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Write an answer or attach a PDF before submitting.",
      });
    }

    // Upload each new PDF using your existing Cloudinary utility.
    for (const file of files) {
      const uploadedFile = await uploadAssignmentPdf(file, "submissions");

      uploadedFiles.push(uploadedFile);
    }

    // Preserve old files until the updated submission is saved.
    const previousAttachments =
      uploadedFiles.length > 0 ? [...existingAttachments] : [];

    // Save the student's answer.
    assignment.submission.text = text;
    assignment.submission.submittedAt = new Date();

    // Replace previous PDFs only when new files are uploaded.
    if (uploadedFiles.length > 0) {
      assignment.submission.attachments = uploadedFiles.map((file) => ({
        fileName: file.fileName,
        fileUrl: file.url,
        publicId: file.publicId,
        mimeType: file.fileType,
        size: file.fileSize,
      }));
    }

    assignment.status = "submitted";

    await assignment.save();

    // The database now references these new files.
    uploadedFiles.length = 0;

    // Clean up replaced PDFs after the save succeeds.
    for (const oldFile of previousAttachments) {
      try {
        await deleteAssignmentPdf(oldFile.publicId);
      } catch (cleanupError) {
        console.error("Old submission PDF cleanup error:", cleanupError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully.",
      assignment,
    });
  } catch (error) {
    console.error("Submit assignment error:", error);

    // Remove newly uploaded PDFs if saving failed.
    for (const file of uploadedFiles) {
      try {
        await deleteAssignmentPdf(file.publicId);
      } catch (cleanupError) {
        console.error("Submission PDF cleanup error:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit assignment.",
    });
  }
};
