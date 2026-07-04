const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
    },
    description: { type: String, required: true },
    jobType: {
      type: String,
      enum: ["Full-time", "Internship", "Contract", "Part-time"],
      default: "Full-time",
    },
    location: { type: String, required: true },
    package: {
      min: { type: Number }, // In LPA
      max: { type: Number },
    },
    eligibility: {
      departments: [
        {
          type: String,
          enum: [
            "Computer Science",
            "Information Technology",
            "Electronics",
            "Mechanical",
            "Civil",
            "Electrical",
            "MBA",
            "MCA",
            "All",
          ],
        },
      ],
      minCGPA: { type: Number, default: 0 },
      maxBacklogs: { type: Number, default: 0 },
      batch: { type: String },
    },
    skills: [{ type: String }],
    applicationDeadline: {
      type: Date,
      required: true,
    },
    driveDate: { type: Date },
    selectionProcess: [{ type: String }],
    status: {
      type: String,
      enum: ["upcoming", "open", "closed", "completed"],
      default: "upcoming",
    },
    totalPositions: { type: Number, default: 1 },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);
