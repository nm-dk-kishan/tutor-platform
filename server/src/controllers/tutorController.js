import mongoose from "mongoose";

import bcrypt from "bcryptjs";

import User from "../models/User.js";
import TutorProfile from "../models/TutorProfile.js";

export const registerTutor = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      name,
      email,
      phone,
      password,

      qualification,
      institution,
      experience,
      bio,

      domain,
      customDomain,
      subjects,
      classes,
      teachingMode,

      city,
      area,
      pincode,
      hourlyFee,
      availability,

      latitude,
      longitude,
    } = req.body;

    // -----------------------------
    // Basic validation
    // -----------------------------

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !qualification ||
      !institution ||
      experience === undefined ||
      !bio ||
      !domain ||
      !city ||
      !area ||
      !pincode ||
      !hourlyFee ||
      !teachingMode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit pincode",
      });
    }

    if (Number(experience) < 0 || Number(experience) > 60) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid teaching experience",
      });
    }

    if (Number(hourlyFee) <= 0 || Number(hourlyFee) > 100000) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid hourly fee",
      });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one subject",
      });
    }

    if (!Array.isArray(classes) || classes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one class",
      });
    }

    if (domain === "other" && !customDomain?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please specify what you want to teach",
      });
    }

    // -----------------------------
    // Normalize email
    // -----------------------------

    const normalizedEmail = email.trim().toLowerCase();

    // -----------------------------
    // Check existing account
    // -----------------------------

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // -----------------------------
    // Transaction
    // -----------------------------

    await session.startTransaction();

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: await bcrypt.hash(password, 12),
      role: "tutor",
      isVerified: false,
    });

    await user.save({ session });

    const tutorProfile = new TutorProfile({
      user: user._id,

      qualification: qualification.trim(),
      institution: institution.trim(),
      experience: Number(experience),
      bio: bio.trim(),

      domain: domain.trim(),
      customDomain: customDomain?.trim() || "",
      subjects,
      classes,
      teachingMode,

      city: city.trim(),
      area: area.trim(),
      pincode: pincode.trim(),

      latitude:
        latitude !== undefined && latitude !== ""
          ? Number(latitude)
          : undefined,

      longitude:
        longitude !== undefined && longitude !== ""
          ? Number(longitude)
          : undefined,

      hourlyFee: Number(hourlyFee),

      availability: Array.isArray(availability) ? availability : [],

      verificationStatus: "pending_interview",

      interview: {
        status: "not_scheduled",
        result: "pending",
      },
    });

    await tutorProfile.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Tutor application submitted successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      tutorProfile: {
        id: tutorProfile._id,
        verificationStatus: tutorProfile.verificationStatus,
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Tutor registration error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong while submitting your tutor application",
    });
  } finally {
    await session.endSession();
  }
};

export const getMyTutorProfile = async (req, res) => {
  try {
    const tutorProfile = await TutorProfile.findOne({
      user: req.user.userId,
    }).populate(
      "user",
      "name email phone role isVerified"
    );

    if (!tutorProfile) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      tutorProfile,
    });
  } catch (error) {
    console.error("Get tutor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tutor profile",
    });
  }
};