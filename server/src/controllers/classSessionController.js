import ClassSession from "../models/ClassSession.js";
import TutorProfile from "../models/TutorProfile.js";
import TutorStudent from "../models/TutorStudent.js";
import User from "../models/User.js";

const calculateDistance = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  const earthRadius = 6371000;

  const lat1 = (latitude1 * Math.PI) / 180;
  const lat2 = (latitude2 * Math.PI) / 180;

  const deltaLat =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const deltaLongitude =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

// ======================================================
// CREATE CLASS SESSION
// ======================================================

export const createClassSession = async (req, res) => {
  try {
    const {
      studentId,
      scheduledStart,
      scheduledEnd,
      mode,
      address,
      latitude,
      longitude,
    } = req.body;

    if (
      !studentId ||
      !scheduledStart ||
      !scheduledEnd ||
      !mode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "studentId, scheduledStart, scheduledEnd and mode are required",
      });
    }

    if (!["home", "online"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode must be home or online",
      });
    }

    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
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

    if (mode === "home") {
      if (
        latitude === undefined ||
        longitude === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Latitude and longitude are required for home classes",
        });
      }
    }

    const session = await ClassSession.create({
      tutor: tutorProfile._id,
      student: studentId,

      scheduledStart: start,
      scheduledEnd: end,

      mode,

      location:
        mode === "home"
          ? {
              address: address || "",
              latitude: Number(latitude),
              longitude: Number(longitude),
              allowedRadiusMeters: 100,
            }
          : undefined,

      status: "scheduled",
      attendanceStatus: "pending",
    });

    const populatedSession = await ClassSession.findById(
      session._id
    )
      .populate("student", "name email phone")
      .populate(
        "tutor",
        "domain subjects classes city area hourlyFee"
      );

    return res.status(201).json({
      success: true,
      message: "Class scheduled successfully",
      session: populatedSession,
    });
  } catch (error) {
    console.error("Create class session error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create class session",
    });
  }
};

// ======================================================
// GET TUTOR'S SESSIONS
// ======================================================

export const getTutorSessions = async (req, res) => {
  try {
    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    const sessions = await ClassSession.find({
      tutor: tutorProfile._id,
    })
      .populate("student", "name email phone")
      .sort({ scheduledStart: 1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Get tutor sessions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tutor sessions",
    });
  }
};

// ======================================================
// GET STUDENT'S SESSIONS
// ======================================================

export const getMySessions = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access their sessions",
      });
    }

    const sessions = await ClassSession.find({
      student: req.user.userId,
    })
      .populate(
        "tutor",
        "domain subjects classes city area hourlyFee"
      )
      .sort({ scheduledStart: 1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Get student sessions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your sessions",
    });
  }
};

// ======================================================
// TUTOR CHECK-IN
// ======================================================

export const tutorCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
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

    const session = await ClassSession.findOne({
      _id: id,
      tutor: tutorProfile._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Class session not found",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "This class cannot be started",
      });
    }

    if (session.mode !== "home") {
      session.tutorCheckIn = {
        checkedIn: true,
        latitude: Number(latitude),
        longitude: Number(longitude),
        checkedInAt: new Date(),
        verified: true,
      };

      session.actualStart = new Date();
      session.status = "tutor_checked_in";

      await session.save();

      return res.status(200).json({
        success: true,
        message: "Tutor checked in successfully",
        session,
      });
    }

    const distance = calculateDistance(
      Number(latitude),
      Number(longitude),
      session.location.latitude,
      session.location.longitude
    );

    const allowedRadius =
      session.location.allowedRadiusMeters || 100;

    if (distance > allowedRadius) {
      return res.status(403).json({
        success: false,
        message: `You are too far from the class location. Distance: ${Math.round(
          distance
        )} meters.`,
        distanceMeters: Math.round(distance),
        allowedRadiusMeters: allowedRadius,
      });
    }

    session.tutorCheckIn = {
      checkedIn: true,
      latitude: Number(latitude),
      longitude: Number(longitude),
      checkedInAt: new Date(),
      distanceFromLocationMeters: Math.round(distance),
      verified: true,
    };

    session.actualStart = new Date();
    session.status = "tutor_checked_in";

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Tutor checked in successfully",
      distanceMeters: Math.round(distance),
      session,
    });
  } catch (error) {
    console.error("Tutor check-in error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check in",
    });
  }
};

// ======================================================
// STUDENT CONFIRMS CLASS
// ======================================================

export const studentConfirmClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can confirm the class",
      });
    }

    const session = await ClassSession.findOne({
      _id: id,
      student: req.user.userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Class session not found",
      });
    }

    if (session.status !== "tutor_checked_in") {
      return res.status(400).json({
        success: false,
        message:
          "Tutor must check in before you can confirm the class",
      });
    }

    session.studentConfirmation = {
      confirmed: true,
      confirmedAt: new Date(),
    };

    session.status = "active";

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Class confirmed successfully",
      session,
    });
  } catch (error) {
    console.error(
      "Student confirmation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to confirm class",
    });
  }
};

// ======================================================
// TUTOR CHECK-OUT
// ======================================================

export const tutorCheckOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
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

    const session = await ClassSession.findOne({
      _id: id,
      tutor: tutorProfile._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Class session not found",
      });
    }

    if (session.status !== "active") {
      return res.status(400).json({
        success: false,
        message:
          "Class must be active before it can be completed",
      });
    }

    let distance = 0;
    let verified = true;

    if (session.mode === "home") {
      distance = calculateDistance(
        Number(latitude),
        Number(longitude),
        session.location.latitude,
        session.location.longitude
      );

      const allowedRadius =
        session.location.allowedRadiusMeters || 100;

      if (distance > allowedRadius) {
        return res.status(403).json({
          success: false,
          message: `You are too far from the class location. Distance: ${Math.round(
            distance
          )} meters.`,
          distanceMeters: Math.round(distance),
          allowedRadiusMeters: allowedRadius,
        });
      }
    }

    const actualEnd = new Date();

    const actualStart = session.actualStart;

    const durationMinutes = Math.max(
      0,
      Math.round(
        (actualEnd.getTime() -
          actualStart.getTime()) /
          (1000 * 60)
      )
    );

    session.tutorCheckOut = {
      checkedOut: true,
      latitude: Number(latitude),
      longitude: Number(longitude),
      checkedOutAt: actualEnd,
      distanceFromLocationMeters:
        Math.round(distance),
      verified,
    };

    session.actualEnd = actualEnd;
    session.durationMinutes = durationMinutes;

    session.status = "completed";
    session.attendanceStatus = "present";

    await session.save();

    return res.status(200).json({
      success: true,
      message:
        "Class completed and attendance recorded",
      durationMinutes,
      session,
    });
  } catch (error) {
    console.error("Tutor check-out error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete class",
    });
  }
};