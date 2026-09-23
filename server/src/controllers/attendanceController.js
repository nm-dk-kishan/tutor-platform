import Attendance from "../models/Attendance.js";
import TutorProfile from "../models/TutorProfile.js";
import TutorStudent from "../models/TutorStudent.js";
import User from "../models/User.js";

const normalizeDate = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
};

// Tutor marks attendance
export const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status, remarks } = req.body;

    if (!studentId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: "studentId, date and status are required",
      });
    }

    if (!["present", "absent", "leave"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status",
      });
    }

    const attendanceDate = normalizeDate(date);

    if (!attendanceDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date",
      });
    }

    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Check that the student actually belongs to this tutor
    const relationship = await TutorStudent.findOne({
      tutor: tutorProfile._id,
      student: studentId,
      status: "active",
    });

    if (!relationship) {
      return res.status(403).json({
        success: false,
        message: "This student is not your active student",
      });
    }

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

    const existingAttendance = await Attendance.findOne({
      tutor: tutorProfile._id,
      student: studentId,
      date: attendanceDate,
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Attendance already exists for this date",
        attendance: existingAttendance,
      });
    }

    const attendance = await Attendance.create({
      tutor: tutorProfile._id,
      student: studentId,
      date: attendanceDate,
      status,
      remarks: remarks?.trim() || "",
      markedBy: req.user.userId,
    });

    const populatedAttendance = await Attendance.findById(
      attendance._id
    )
      .populate("student", "name email phone")
      .populate("markedBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      attendance: populatedAttendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark attendance",
    });
  }
};

// Tutor gets attendance for one student
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    const relationship = await TutorStudent.findOne({
      tutor: tutorProfile._id,
      student: studentId,
      status: "active",
    });

    if (!relationship) {
      return res.status(403).json({
        success: false,
        message: "This student is not your active student",
      });
    }

    const attendance = await Attendance.find({
      tutor: tutorProfile._id,
      student: studentId,
    })
      .populate("student", "name email phone")
      .sort({ date: -1 });

    const total = attendance.length;

    const present = attendance.filter(
      (item) => item.status === "present"
    ).length;

    const absent = attendance.filter(
      (item) => item.status === "absent"
    ).length;

    const leave = attendance.filter(
      (item) => item.status === "leave"
    ).length;

    const percentage =
      total > 0
        ? Number(((present / total) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      student: attendance[0]?.student || null,
      summary: {
        total,
        present,
        absent,
        leave,
        percentage,
      },
      attendance,
    });
  } catch (error) {
    console.error("Get student attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch student attendance",
    });
  }
};

// Student gets their own attendance
export const getMyAttendance = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access their own attendance",
      });
    }

    const attendance = await Attendance.find({
      student: req.user.userId,
    })
      .populate("tutor", "domain subjects classes city hourlyFee")
      .sort({ date: -1 });

    const total = attendance.length;

    const present = attendance.filter(
      (item) => item.status === "present"
    ).length;

    const absent = attendance.filter(
      (item) => item.status === "absent"
    ).length;

    const leave = attendance.filter(
      (item) => item.status === "leave"
    ).length;

    const percentage =
      total > 0
        ? Number(((present / total) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      summary: {
        total,
        present,
        absent,
        leave,
        percentage,
      },
      attendance,
    });
  } catch (error) {
    console.error("Get my attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your attendance",
    });
  }
};

// Update attendance
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!["present", "absent", "leave"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status",
      });
    }

    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    const attendance = await Attendance.findOne({
      _id: id,
      tutor: tutorProfile._id,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    attendance.status = status;

    if (remarks !== undefined) {
      attendance.remarks = remarks.trim();
    }

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update attendance",
    });
  }
};