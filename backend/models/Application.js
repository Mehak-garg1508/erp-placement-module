const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "aptitude_cleared",
        "interview_scheduled",
        "selected",
        "rejected",
        "withdrawn",
      ],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    interviewDate: { type: Date },
    offerLetterUrl: { type: String },
    package: { type: Number }, // Final offered package in LPA
    feedback: { type: String },
    rounds: [
      {
        roundName: String,
        status: {
          type: String,
          enum: ["pending", "cleared", "failed"],
          default: "pending",
        },
        date: Date,
        feedback: String,
      },
    ],
  },
  { timestamps: true },
);

// Prevent duplicate applications
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
