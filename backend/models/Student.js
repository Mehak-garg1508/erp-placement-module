const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        "Computer Science",
        "Information Technology",
        "Electronics",
        "Mechanical",
        "Civil",
        "Electrical",
        "MBA",
        "MCA",
      ],
    },
    batch: {
      type: String,
      required: true,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    backlogsCount: {
      type: Number,
      default: 0,
    },
    skills: [{ type: String }],
    resumeUrl: { type: String },
    phone: { type: String },
    address: { type: String },
    linkedin: { type: String },
    github: { type: String },
    placementStatus: {
      type: String,
      enum: ["not_placed", "placed", "opted_out"],
      default: "not_placed",
    },
    placedCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    placedPackage: {
      type: Number, // In LPA
    },
    tenthPercent: { type: Number },
    twelfthPercent: { type: Number },
    graduationPercent: { type: Number },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
