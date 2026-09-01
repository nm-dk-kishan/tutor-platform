import mongoose from "mongoose";

const tutorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Professional information
    qualification: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
    },

    bio: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 1000,
    },

    // Teaching information
    domain: {
      type: String,
      required: true,
      trim: true,
    },

    customDomain: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    subjects: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one subject is required",
      },
    },

    classes: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one class is required",
      },
    },

    teachingMode: {
      type: String,
      enum: ["online", "home", "both"],
      required: true,
    },

    // Location
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    area: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    pincode: {
      type: String,
      required: true,
      match: /^[1-9][0-9]{5}$/,
    },

    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },

    // Fees
    hourlyFee: {
      type: Number,
      required: true,
      min: 1,
      max: 100000,
    },

    // Availability
    availability: {
      type: [String],
      default: [],
    },

    // Verification
    verificationStatus: {
      type: String,
      enum: [
        "pending_interview",
        "interview_scheduled",
        "interview_completed",
        "under_review",
        "approved",
        "rejected",
        "cancelled",
      ],
      default: "pending_interview",
    },

    interview: {
      scheduledAt: {
        type: Date,
      },

      durationMinutes: {
        type: Number,
        default: 30,
      },

      status: {
        type: String,
        enum: [
          "not_scheduled",
          "scheduled",
          "completed",
          "cancelled",
        ],
        default: "not_scheduled",
      },

      score: {
        type: Number,
        min: 0,
        max: 100,
      },

      result: {
        type: String,
        enum: ["pending", "passed", "failed"],
        default: "pending",
      },

      remarks: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },

    // Admin verification
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

const TutorProfile = mongoose.model(
  "TutorProfile",
  tutorProfileSchema,
);

export default TutorProfile;