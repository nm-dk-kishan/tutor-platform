import TutorRequest from "../models/TutorRequest.js";
import TutorProfile from "../models/TutorProfile.js";
import TutorStudent from "../models/TutorStudent.js";

export const sendTutorRequest = async (req, res) => {
  try {
    const { tutorId, message } = req.body;

    // Only student and parent can send requests
    if (!["student", "parent"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only students and parents can send tutor requests",
      });
    }

    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: "Tutor ID is required",
      });
    }

    // Find approved tutor
    const tutor = await TutorProfile.findOne({
      _id: tutorId,
      verificationStatus: "approved",
    });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Approved tutor not found",
      });
    }

    // Check existing pending request
    const existingRequest = await TutorRequest.findOne({
      requester: req.user.userId,
      tutor: tutorId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending request with this tutor",
      });
    }

    const tutorRequest = await TutorRequest.create({
      requester: req.user.userId,
      tutor: tutorId,
      message: message?.trim() || "",
      status: "pending",
    });

    const populatedRequest = await TutorRequest.findById(
      tutorRequest._id
    )
      .populate("requester", "name email phone role")
      .populate({
        path: "tutor",
        populate: {
          path: "user",
          select: "name email phone",
        },
      });

    return res.status(201).json({
      success: true,
      message: "Tutor request sent successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("Send tutor request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send tutor request",
    });
  }
};

export const getReceivedRequests = async (req, res) => {
  try {
    // Find the tutor profile belonging to logged-in tutor
    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Find requests sent to this tutor
    const requests = await TutorRequest.find({
      tutor: tutorProfile._id,
    })
      .populate("requester", "name email phone role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get received requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tutor requests",
    });
  }
};

export const acceptTutorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    const tutorRequest = await TutorRequest.findOne({
      _id: id,
      tutor: tutorProfile._id,
    });

    if (!tutorRequest) {
      return res.status(404).json({
        success: false,
        message: "Tutor request not found",
      });
    }

    if (tutorRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be accepted",
      });
    }

    // Update request
    tutorRequest.status = "accepted";
    tutorRequest.respondedAt = new Date();

    await tutorRequest.save();

    // Create tutor-student relationship
    const existingRelationship = await TutorStudent.findOne({
      tutor: tutorProfile._id,
      student: tutorRequest.requester,
    });

    let tutorStudent = existingRelationship;

    if (!tutorStudent) {
      tutorStudent = await TutorStudent.create({
        tutor: tutorProfile._id,
        student: tutorRequest.requester,
        status: "active",
        startedAt: new Date(),
      });
    } else {
      tutorStudent.status = "active";
      tutorStudent.endedAt = undefined;

      await tutorStudent.save();
    }

    return res.status(200).json({
      success: true,
      message: "Tutor request accepted",
      request: tutorRequest,
      tutorStudent,
    });
  } catch (error) {
    console.error("Accept tutor request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to accept tutor request",
    });
  }
};

export const rejectTutorRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find tutor profile of logged-in tutor
    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Find request belonging to this tutor
    const tutorRequest = await TutorRequest.findOne({
      _id: id,
      tutor: tutorProfile._id,
    });

    if (!tutorRequest) {
      return res.status(404).json({
        success: false,
        message: "Tutor request not found",
      });
    }

    if (tutorRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been handled",
      });
    }

    tutorRequest.status = "rejected";
    tutorRequest.respondedAt = new Date();

    await tutorRequest.save();

    return res.status(200).json({
      success: true,
      message: "Tutor request rejected",
      request: tutorRequest,
    });
  } catch (error) {
    console.error("Reject tutor request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject tutor request",
    });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    if (!["student", "parent"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only students and parents can view their requests",
      });
    }

    const requests = await TutorRequest.find({
      requester: req.user.userId,
    })
      .populate({
        path: "tutor",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my tutor requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your tutor requests",
    });
  }
};

export const getMyStudents = async (req, res) => {
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

    const students = await TutorStudent.find({
      tutor: tutorProfile._id,
      status: "active",
    })
      .populate("student", "name email phone role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get tutor students error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch students",
    });
  }
};