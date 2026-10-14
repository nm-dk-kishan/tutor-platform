import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    // Tutor who created the assignment
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TutorProfile",
      required: true,
    },

    // Student who must complete it
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Assignment title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // Assignment instructions
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Optional due date
    dueDate: {
      type: Date,
    },

    // Optional files uploaded by the tutor
    // Files attached by the tutor
    attachments: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
        fileType: {
          type: String,
          default: "",
        },
        accessMode: {
          type: String,
          enum: ["public", "private"],
          default: "public",
        },
        fileSize: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Assignment status
    status: {
      type: String,
      enum: ["assigned", "submitted", "reviewed", "overdue"],
      default: "assigned",
    },

    // Student submission
    submission: {
      text: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: "",
      },

      // Optional file submitted by the student
      attachments: [
        {
          fileName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
          },

          fileUrl: {
            type: String,
            required: true,
          },

          publicId: {
            type: String,
            required: true,
          },

          mimeType: {
            type: String,
            enum: ["application/pdf"],
            required: true,
          },
          accessMode: {
            type: String,
            enum: ["public", "private"],
            default: "public",
          },

          size: {
            type: Number,
            min: 1,
            required: true,
          },
        },
      ],

      submittedAt: {
        type: Date,
      },
    },

    // Tutor review
    review: {
      marks: {
        type: Number,
        min: 0,
        max: 100,
      },

      feedback: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      reviewedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Quickly find assignments for a student
assignmentSchema.index({
  student: 1,
  createdAt: -1,
});

// Quickly find assignments created by a tutor
assignmentSchema.index({
  tutor: 1,
  createdAt: -1,
});

export default mongoose.model("Assignment", assignmentSchema);
