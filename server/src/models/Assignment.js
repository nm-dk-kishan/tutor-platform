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
  }
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

export default mongoose.model(
  "Assignment",
  assignmentSchema
);