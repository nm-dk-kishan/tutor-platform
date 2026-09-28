import mongoose from "mongoose";

const classSessionSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TutorProfile",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scheduledStart: {
      type: Date,
      required: true,
    },

    scheduledEnd: {
      type: Date,
      required: true,
    },

    // Home / offline / online
    mode: {
      type: String,
      enum: ["home", "online"],
      required: true,
    },

    // Location where the class is supposed to happen
    location: {
      address: {
        type: String,
        trim: true,
        default: "",
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

      allowedRadiusMeters: {
        type: Number,
        default: 100,
        min: 10,
        max: 1000,
      },
    },

    // Actual tutor check-in
    tutorCheckIn: {
      checkedIn: {
        type: Boolean,
        default: false,
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

      checkedInAt: Date,

      distanceFromLocationMeters: Number,

      verified: {
        type: Boolean,
        default: false,
      },
    },

    // Student confirms that class actually started
    studentConfirmation: {
      confirmed: {
        type: Boolean,
        default: false,
      },

      confirmedAt: Date,

      otp: {
        type: String,
      },
    },

    // Actual tutor checkout
    tutorCheckOut: {
      checkedOut: {
        type: Boolean,
        default: false,
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

      checkedOutAt: Date,

      distanceFromLocationMeters: Number,

      verified: {
        type: Boolean,
        default: false,
      },
    },

    actualStart: Date,

    actualEnd: Date,

    durationMinutes: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "tutor_checked_in",
        "student_confirmed",
        "active",
        "completed",
        "tutor_absent",
        "student_absent",
        "cancelled",
        "disputed",
      ],
      default: "scheduled",
    },

    attendanceStatus: {
      type: String,
      enum: [
        "pending",
        "present",
        "absent",
        "leave",
        "disputed",
      ],
      default: "pending",
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

classSessionSchema.index({
  tutor: 1,
  student: 1,
  scheduledStart: 1,
});

export default mongoose.model("ClassSession", classSessionSchema);