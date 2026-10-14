import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import TutorProfile from "../models/TutorProfile.js";
import TutorStudent from "../models/TutorStudent.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import cloudinary from "../config/cloudinary.js";

import {
  uploadAssignmentPdf,
  deleteAssignmentPdf,
} from "../utils/assignmentFileService.js";

const createNotificationSafely = async (notification) => {
  try {
    await Notification.updateOne(
      { eventKey: notification.eventKey },
      { $setOnInsert: notification },
      { upsert: true },
    );
  } catch (error) {
    console.error("Assignment notification error:", error);
  }
};

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
    if (
      typeof studentId !== "string" ||
      !mongoose.isValidObjectId(studentId) ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid student, title and description are required",
      });
    }

    if (title.trim().length > 200 || description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Title or description exceeds the allowed length",
      });
    }

    // Validate the optional due date and reject deadlines that are not in
    // the future.
    let parsedDueDate;
    if (dueDate) {
      if (typeof dueDate !== "string") {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid future due date",
        });
      }
      parsedDueDate = new Date(dueDate);
      if (
        Number.isNaN(parsedDueDate.getTime()) ||
        parsedDueDate.getTime() <= Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid future due date",
        });
      }
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
      dueDate: parsedDueDate,
      attachments: uploadedFiles,
    });

    // Database creation succeeded, so keep the uploaded files.
    uploadedFiles.length = 0;

    try {
      const tutor = await User.findById(req.user.userId).select("name");
      await createNotificationSafely({
        recipient: student._id,
        type: "assignment_created",
        title: "New assignment",
        message: `${tutor?.name || "Your tutor"} assigned "${assignment.title}"${
          assignment.dueDate
            ? `, due ${assignment.dueDate.toLocaleString("en-IN")}`
            : ""
        }.`,
        relatedAssignment: assignment._id,
        link: "/student/assignments",
        eventKey: `assignment-created:${assignment._id}`,
      });
    } catch (notificationError) {
      console.error("Assignment notification error:", notificationError);
    }

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
        await deleteAssignmentPdf(file.publicId, file.accessMode);
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

export const getAssignmentFile = async (req, res) => {
  try {
    const { assignmentId, fileKind, fileIndex } = req.params;
    const index = Number(fileIndex);

    if (
      !mongoose.isValidObjectId(assignmentId) ||
      !Number.isInteger(index) ||
      index < 0 ||
      !["assignment", "submission"].includes(fileKind)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment file request.",
      });
    }

    let query = { _id: assignmentId };
    if (req.user.role === "student") {
      query.student = req.user.userId;
    } else if (req.user.role === "tutor") {
      const tutorProfile = await TutorProfile.findOne({
        user: req.user.userId,
      });
      if (!tutorProfile) {
        return res.status(404).json({
          success: false,
          message: "Tutor profile not found.",
        });
      }
      query.tutor = tutorProfile._id;
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access assignment files.",
      });
    }

    const assignment = await Assignment.findOne(query).select(
      "attachments submission.attachments",
    );
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const file =
      fileKind === "assignment"
        ? assignment.attachments[index]
        : assignment.submission?.attachments[index];
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Assignment file not found.",
      });
    }

    if (file.accessMode !== "private" || !file.publicId) {
      let publicUrl = file.url || file.fileUrl;
      if (!publicUrl) {
        return res.status(404).json({
          success: false,
          message: "Assignment file is unavailable.",
        });
      }
      if (req.query.download === "true" && publicUrl.includes("/upload/")) {
        publicUrl = publicUrl.replace("/upload/", "/upload/fl_attachment/");
      }
      return res.redirect(302, publicUrl);
    }

    const signedUrl = cloudinary.utils.private_download_url(
      file.publicId,
      "pdf",
      {
        resource_type: "raw",
        type: "private",
        expires_at: Math.floor(Date.now() / 1000) + 300,
        attachment: req.query.download === "true",
      },
    );

    return res.redirect(302, signedUrl);
  } catch (error) {
    console.error("Get assignment file error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to access assignment file.",
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

    if (req.body.text !== undefined && typeof req.body.text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Your answer must be text.",
      });
    }
    const text = req.body.text?.trim() || "";

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

    // Submitted assignments are final; revisions and resubmissions are not
    // supported.
    if (
      assignment.submission?.submittedAt ||
      assignment.status === "submitted" ||
      assignment.status === "reviewed" ||
      assignment.review?.reviewedAt
    ) {
      return res.status(400).json({
        success: false,
        message: "This assignment has already been submitted.",
      });
    }

    const deadline = assignment.dueDate
      ? new Date(assignment.dueDate).getTime()
      : Number.NaN;
    if (Number.isFinite(deadline) && Date.now() > deadline) {
      return res.status(400).json({
        success: false,
        message: "The submission deadline for this assignment has passed.",
      });
    }

    const files = req.files || [];

    // Require an answer or a PDF.
    if (!text && files.length === 0) {
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

    const submittedAt = new Date();
    const submissionAttachments = uploadedFiles.map((file) => ({
      fileName: file.fileName,
      fileUrl: file.url,
      publicId: file.publicId,
      mimeType: file.fileType,
      size: file.fileSize,
      accessMode: file.accessMode,
    }));

    // Recheck ownership, submission state, and deadline atomically to prevent
    // simultaneous submissions or a deadline passing during file upload.
    const updatedAssignment = await Assignment.findOneAndUpdate(
      {
        _id: assignmentId,
        student: req.user.userId,
        $and: [
          {
            $or: [
              { "submission.submittedAt": { $exists: false } },
              { "submission.submittedAt": null },
            ],
          },
          {
            $or: [
              { dueDate: { $exists: false } },
              { dueDate: null },
              { dueDate: { $gte: submittedAt } },
            ],
          },
        ],
      },
      {
        $set: {
          "submission.text": text,
          "submission.attachments": submissionAttachments,
          "submission.submittedAt": submittedAt,
          status: "submitted",
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedAssignment) {
      const latestAssignment = await Assignment.findOne({
        _id: assignmentId,
        student: req.user.userId,
      });

      for (const file of uploadedFiles) {
        try {
          await deleteAssignmentPdf(file.publicId, file.accessMode);
        } catch (cleanupError) {
          console.error("Submission PDF cleanup error:", cleanupError);
        }
      }
      uploadedFiles.length = 0;

      if (!latestAssignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found for this student.",
        });
      }

      if (
        latestAssignment.submission?.submittedAt ||
        latestAssignment.status === "submitted" ||
        latestAssignment.status === "reviewed" ||
        latestAssignment.review?.reviewedAt
      ) {
        return res.status(400).json({
          success: false,
          message: "This assignment has already been submitted.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "The submission deadline for this assignment has passed.",
      });
    }

    // The database now references these new files.
    uploadedFiles.length = 0;

    try {
      const tutorProfile = await TutorProfile.findById(
        updatedAssignment.tutor,
      ).populate("user", "name");
      const student = await User.findById(req.user.userId).select("name");
      await createNotificationSafely({
        recipient: tutorProfile?.user?._id,
        type: "assignment_submitted",
        title: "Assignment submitted",
        message: `${student?.name || "A student"} submitted "${
          updatedAssignment.title
        }" at ${submittedAt.toLocaleString("en-IN")}.`,
        relatedAssignment: updatedAssignment._id,
        link: "/tutor/assignments",
        eventKey: `assignment-submitted:${updatedAssignment._id}`,
      });
    } catch (notificationError) {
      console.error("Assignment notification error:", notificationError);
    }

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully.",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Submit assignment error:", error);

    // Remove newly uploaded PDFs if saving failed.
    for (const file of uploadedFiles) {
      try {
        await deleteAssignmentPdf(file.publicId, file.accessMode);
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


/* ==========================================
   REVIEW ASSIGNMENT (TUTOR)
========================================== */

export const reviewAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { marks, feedback = "" } = req.body;

    // Only tutors can review assignments.
    if (req.user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Only tutors can review assignments.",
      });
    }

    // Validate the assignment ID.
    if (!mongoose.isValidObjectId(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    // Validate marks: they must be a number between 0 and 100.
    if (
      marks === undefined ||
      marks === null ||
      marks === "" ||
      typeof marks !== "number" ||
      !Number.isFinite(marks) ||
      marks < 0 ||
      marks > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Marks must be a number between 0 and 100.",
      });
    }

    // Validate feedback.
    if (typeof feedback !== "string" || feedback.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Feedback must be text of at most 2000 characters.",
      });
    }

    // Find the logged-in tutor's profile.
    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found.",
      });
    }

    // Tutors can review only their own assignments.
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      tutor: tutorProfile._id,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    // The student must submit the assignment first.
    if (!assignment.submission?.submittedAt) {
      return res.status(400).json({
        success: false,
        message: "The student has not submitted this assignment yet.",
      });
    }

    if (assignment.review?.reviewedAt || assignment.status === "reviewed") {
      return res.status(409).json({
        success: false,
        message: "This assignment has already been reviewed.",
      });
    }

    const reviewedAt = new Date();
    const reviewedAssignment = await Assignment.findOneAndUpdate(
      {
        _id: assignmentId,
        tutor: tutorProfile._id,
        $and: [
          { "submission.submittedAt": { $exists: true, $ne: null } },
          {
            $or: [
              { "review.reviewedAt": { $exists: false } },
              { "review.reviewedAt": null },
            ],
          },
        ],
      },
      {
        $set: {
          "review.marks": marks,
          "review.feedback": feedback.trim(),
          "review.reviewedAt": reviewedAt,
          status: "reviewed",
        },
      },
      { new: true, runValidators: true },
    );

    if (!reviewedAssignment) {
      return res.status(409).json({
        success: false,
        message: "This assignment has already been reviewed.",
      });
    }

    try {
      const tutor = await User.findById(req.user.userId).select("name");
      await createNotificationSafely({
        recipient: reviewedAssignment.student,
        type: "assignment_reviewed",
        title: "Assignment reviewed",
        message: `${tutor?.name || "Your tutor"} reviewed "${
          reviewedAssignment.title
        }": ${marks} / 100.`,
        relatedAssignment: reviewedAssignment._id,
        link: "/student/assignments",
        eventKey: `assignment-reviewed:${reviewedAssignment._id}`,
      });
    } catch (notificationError) {
      console.error("Assignment notification error:", notificationError);
    }

    return res.status(200).json({
      success: true,
      message: "Assignment reviewed successfully.",
      assignment: reviewedAssignment,
    });
  } catch (error) {
    console.error("Review assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to review assignment.",
    });
  }
};


/* ==========================================
   DELETE ASSIGNMENT (TUTOR)
========================================== */

export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Only tutors can delete assignments.
    if (req.user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Only tutors can delete assignments.",
      });
    }

    // Validate the assignment ID.
    if (!mongoose.isValidObjectId(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    // Find the logged-in tutor's profile.
    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found.",
      });
    }

    // A tutor can delete only their own assignments.
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      tutor: tutorProfile._id,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    // Collect assignment PDFs and student-submission PDFs.
    const filesToDelete = [
      ...(assignment.attachments || []),
      ...(assignment.submission?.attachments || []),
    ];

    // Delete the database record first.
    await Assignment.deleteOne({
      _id: assignment._id,
      tutor: tutorProfile._id,
    });

    // Clean up associated Cloudinary files, but retain any file still
    // referenced by another assignment record.
    const uniqueFiles = [
      ...new Map(
        filesToDelete
          .filter((file) => file.publicId)
          .map((file) => [file.publicId, file]),
      ).values(),
    ];

    for (const file of uniqueFiles) {
      if (!file.publicId) continue;

      try {
        const stillReferenced = await Assignment.exists({
          _id: { $ne: assignment._id },
          $or: [
            { "attachments.publicId": file.publicId },
            { "submission.attachments.publicId": file.publicId },
          ],
        });
        if (stillReferenced) continue;
        await deleteAssignmentPdf(file.publicId, file.accessMode);
      } catch (cleanupError) {
        console.error(
          "Assignment file cleanup error:",
          file.publicId,
          cleanupError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete assignment.",
    });
  }
};
