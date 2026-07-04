const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      unique: true,
      trim: true,
    },
    industry: {
      type: String,
      required: true,
      enum: [
        "IT",
        "Finance",
        "Healthcare",
        "Manufacturing",
        "Consulting",
        "E-commerce",
        "Startup",
        "Government",
        "Other",
      ],
    },
    website: { type: String },
    description: { type: String },
    logoUrl: { type: String },
    contactPerson: {
      name: String,
      email: String,
      phone: String,
      designation: String,
    },
    address: { type: String },
    isActive: {
      type: Boolean,
      default: true,
    },
    visitHistory: [
      {
        year: String,
        studentsPlaced: Number,
        avgPackage: Number,
        highestPackage: Number,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Company", companySchema);
