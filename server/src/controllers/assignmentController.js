import Assignment from "../models/Assignment.js";
import TutorProfile from "../models/TutorProfile.js";
import TutorStudent from "../models/TutorStudent.js";
import User from "../models/User.js";

// ==========================================
// CREATE ASSIGNMENT
// ==========================================

export const createAssignment = async (req, res) => {
  try {
    const {
      studentId,
      title,
      description,
      dueDate,
    } = req.body;

    // Only tutors can create assignments
    if (req.user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message: "Only tutors can create assignments",
      });
    }

    // Validate required fields
    if (!studentId || !title || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Student, title and description are required",
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

    // Make sure this student is actually connected
    // to this tutor
    const relationship = await TutorStudent.findOne({
      tutor: tutorProfile._id,
      student: studentId,
      status: "active",
    });

    if (!relationship) {
      return res.status(403).json({
        success: false,
        message:
          "You can only create assignments for your active students",
      });
    }

    // Make sure student exists
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

    // Create assignment
    const assignment = await Assignment.create({
      tutor: tutorProfile._id,
      student: studentId,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error(
      "Create assignment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create assignment",
    });
  }
};

// ==========================================
// GET TUTOR ASSIGNMENTS
// ==========================================

export const getTutorAssignments = async (
  req,
  res
) => {
  try {
    // Only tutors
    if (req.user.role !== "tutor") {
      return res.status(403).json({
        success: false,
        message:
          "Only tutors can access these assignments",
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
      .populate(
        "student",
        "name email phone"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get tutor assignments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load assignments",
    });
  }
};

// ==========================================
// GET STUDENT ASSIGNMENTS
// ==========================================

export const getStudentAssignments = async (
  req,
  res
) => {
  try {
    // Only students
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "Only students can access their assignments",
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
    console.error(
      "Get student assignments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load assignments",
    });
  }
};