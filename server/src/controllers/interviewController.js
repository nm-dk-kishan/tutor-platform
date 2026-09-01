import TutorProfile from "../models/TutorProfile.js";

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

    if (
      tutorProfile.verificationStatus !== "pending_interview"
    ) {
      return res.status(400).json({
        success: false,
        message: "Tutor is not waiting for an interview",
      });
    }

    tutorProfile.interview.scheduledAt = interviewDate;
    tutorProfile.interview.durationMinutes =
      Number(durationMinutes);
    tutorProfile.interview.status = "scheduled";

    tutorProfile.verificationStatus =
      "interview_scheduled";

    await tutorProfile.save();

    return res.status(200).json({
      success: true,
      message: "Interview scheduled successfully",
      interview: tutorProfile.interview,
      verificationStatus:
        tutorProfile.verificationStatus,
    });
  } catch (error) {
    console.error("Schedule interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to schedule interview",
    });
  }
};