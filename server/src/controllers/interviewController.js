import TutorProfile from "../models/TutorProfile.js";
import User from "../models/User.js";

export const scheduleInterview = async (req, res) => {
  try {
    const { tutorProfileId } = req.params;
    const { scheduledAt, durationMinutes = 30 } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Interview date and time are required",
      });
    }

    const interviewDate = new Date(scheduledAt);

    if (isNaN(interviewDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview date and time",
      });
    }

    if (interviewDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Interview must be scheduled in the future",
      });
    }

    const tutorProfile = await TutorProfile.findById(tutorProfileId);

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    if (tutorProfile.verificationStatus !== "pending_interview") {
      return res.status(400).json({
        success: false,
        message: "Tutor is not waiting for an interview",
      });
    }

    tutorProfile.interview.scheduledAt = interviewDate;
    tutorProfile.interview.durationMinutes = Number(durationMinutes);
    tutorProfile.interview.status = "scheduled";
    tutorProfile.verificationStatus = "interview_scheduled";

    await tutorProfile.save();

    return res.status(200).json({
      success: true,
      message: "Interview scheduled successfully",
      interview: tutorProfile.interview,
      verificationStatus: tutorProfile.verificationStatus,
    });
  } catch (error) {
    console.error("Schedule interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to schedule interview",
    });
  }
};

export const completeInterview = async (req, res) => {
  try {
    const { tutorProfileId } = req.params;
    const { score, remarks } = req.body;

    if (score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Interview score is required",
      });
    }

    if (Number(score) < 0 || Number(score) > 100) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 100",
      });
    }

    const tutorProfile = await TutorProfile.findById(tutorProfileId);

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    if (tutorProfile.verificationStatus !== "interview_scheduled") {
      return res.status(400).json({
        success: false,
        message: "Tutor does not have a scheduled interview",
      });
    }

    tutorProfile.interview.status = "completed";
    tutorProfile.interview.score = Number(score);
    tutorProfile.interview.remarks = remarks?.trim() || "";
    tutorProfile.interview.result =
      Number(score) >= 60 ? "passed" : "failed";

    tutorProfile.verificationStatus = "interview_completed";

    await tutorProfile.save();

    return res.status(200).json({
      success: true,
      message: "Interview completed successfully",
      interview: tutorProfile.interview,
      verificationStatus: tutorProfile.verificationStatus,
    });
  } catch (error) {
    console.error("Complete interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete interview",
    });
  }
};

export const approveTutor = async (req, res) => {
  try {
    const { tutorProfileId } = req.params;

    const tutorProfile = await TutorProfile.findById(tutorProfileId);

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    if (tutorProfile.verificationStatus !== "interview_completed") {
      return res.status(400).json({
        success: false,
        message: "Interview must be completed before approval",
      });
    }

    if (tutorProfile.interview.result !== "passed") {
      return res.status(400).json({
        success: false,
        message: "Tutor did not pass the interview",
      });
    }

    tutorProfile.verificationStatus = "approved";
    tutorProfile.reviewedBy = req.user.userId;
    tutorProfile.reviewedAt = new Date();

    await tutorProfile.save();

    await User.findByIdAndUpdate(tutorProfile.user, {
      isVerified: true,
    });

    return res.status(200).json({
      success: true,
      message: "Tutor approved successfully",
      verificationStatus: tutorProfile.verificationStatus,
    });
  } catch (error) {
    console.error("Approve tutor error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve tutor",
    });
  }
};

export const rejectTutor = async (req, res) => {
  try {
    const { tutorProfileId } = req.params;
    const { reason } = req.body;

    if (!reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const tutorProfile = await TutorProfile.findById(tutorProfileId);

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    if (tutorProfile.verificationStatus !== "interview_completed") {
      return res.status(400).json({
        success: false,
        message: "Interview must be completed before rejection",
      });
    }

    tutorProfile.verificationStatus = "rejected";
    tutorProfile.rejectionReason = reason.trim();
    tutorProfile.reviewedBy = req.user.userId;
    tutorProfile.reviewedAt = new Date();

    await tutorProfile.save();

    await User.findByIdAndUpdate(tutorProfile.user, {
      isVerified: false,
    });

    return res.status(200).json({
      success: true,
      message: "Tutor rejected successfully",
      verificationStatus: tutorProfile.verificationStatus,
      rejectionReason: tutorProfile.rejectionReason,
    });
  } catch (error) {
    console.error("Reject tutor error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject tutor",
    });
  }
};

export const getTutorApplications = async (req, res) => {
  try {
    const tutorProfiles = await TutorProfile.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tutorProfiles,
    });
  } catch (error) {
    console.error("Get tutor applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load tutor applications",
    });
  }
};

export const reapplyTutor = async (req, res) => {
  try {
    const { domain, customDomain, subjects, classes } = req.body;

    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    });

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    if (tutorProfile.verificationStatus !== "rejected") {
      return res.status(400).json({
        success: false,
        message: "Only rejected tutors can reapply",
      });
    }

    if (!domain?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Teaching domain is required",
      });
    }

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one subject is required",
      });
    }

    if (!classes || !Array.isArray(classes) || classes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one class is required",
      });
    }

    tutorProfile.domain = domain.trim();
    tutorProfile.customDomain = customDomain?.trim() || "";
    tutorProfile.subjects = subjects;
    tutorProfile.classes = classes;

    tutorProfile.verificationStatus = "pending_interview";

    tutorProfile.interview = {
      scheduledAt: undefined,
      durationMinutes: 30,
      status: "not_scheduled",
      score: undefined,
      result: "pending",
      remarks: "",
    };

    tutorProfile.reviewedBy = undefined;
    tutorProfile.reviewedAt = undefined;
    tutorProfile.rejectionReason = undefined;

    await tutorProfile.save();

    await User.findByIdAndUpdate(tutorProfile.user, {
      isVerified: false,
    });

    return res.status(200).json({
      success: true,
      message: "Tutor application resubmitted successfully",
      tutorProfile,
    });
  } catch (error) {
    console.error("Reapply tutor error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to resubmit tutor application",
    });
  }
};

export const rescheduleInterview = async (req, res) => {
  try {
    const { scheduledAt, durationMinutes } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Interview date and time are required",
      });
    }

    const newDate = new Date(scheduledAt);

    if (Number.isNaN(newDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview date and time",
      });
    }

    if (newDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Interview must be scheduled for a future date",
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

    if (
      tutorProfile.verificationStatus !== "interview_scheduled" ||
      tutorProfile.interview?.status !== "scheduled"
    ) {
      return res.status(400).json({
        success: false,
        message: "You do not have a scheduled interview",
      });
    }

    tutorProfile.interview.scheduledAt = newDate;

    if (durationMinutes !== undefined) {
      const duration = Number(durationMinutes);

      if (![15, 30, 45, 60].includes(duration)) {
        return res.status(400).json({
          success: false,
          message: "Invalid interview duration",
        });
      }

      tutorProfile.interview.durationMinutes = duration;
    }

    await tutorProfile.save();

    return res.status(200).json({
      success: true,
      message: "Interview rescheduled successfully",
      tutorProfile,
    });
  } catch (error) {
    console.error("Reschedule interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reschedule interview",
    });
  }
};