const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");

const seedDemoData = async () => {
  const [userCount, studentCount, companyCount, jobCount] = await Promise.all([
    User.countDocuments(),
    Student.countDocuments(),
    Company.countDocuments(),
    Job.countDocuments(),
  ]);

  if (studentCount || companyCount || jobCount) {
    return;
  }

  console.log("Seeding demo data because the database is empty...");

  const adminUser = await User.create({
    name: "System Admin",
    email: "admin@erp.com",
    password: "admin123",
    role: "admin",
  });

  const officerUser = await User.create({
    name: "Placement Officer",
    email: "officer@erp.com",
    password: "officer123",
    role: "placement_officer",
  });

  const studentUser = await User.create({
    name: "Jane Student",
    email: "student@erp.com",
    password: "student123",
    role: "student",
  });

  const studentProfile = await Student.create({
    user: studentUser._id,
    rollNumber: "CS2024001",
    department: "Computer Science",
    batch: "2024",
    cgpa: 8.8,
    backlogsCount: 0,
    skills: ["React", "Node.js", "MongoDB"],
    phone: "9998887770",
    address: "123 Campus Drive",
    linkedin: "https://linkedin.com/in/janestudent",
    github: "https://github.com/janestudent",
  });

  const google = await Company.create({
    name: "Google",
    industry: "IT",
    website: "https://google.com",
    description: "Global technology company focused on internet services and products.",
    contactPerson: {
      name: "Alice HR",
      email: "alice@google.com",
      phone: "1234567890",
      designation: "University Recruiter",
    },
    address: "Mountain View, CA",
  });

  const microsoft = await Company.create({
    name: "Microsoft",
    industry: "IT",
    website: "https://microsoft.com",
    description: "Global software and cloud computing company.",
    contactPerson: {
      name: "Bob Recruiter",
      email: "bob@microsoft.com",
      phone: "2345678901",
      designation: "Campus Relations",
    },
    address: "Redmond, WA",
  });

  const jobGoogle = await Job.create({
    company: google._id,
    title: "Software Engineer",
    description: "Build scalable web applications and backend services.",
    jobType: "Full-time",
    location: "Bangalore, India",
    package: { min: 20, max: 35 },
    eligibility: {
      departments: ["Computer Science", "Information Technology", "MCA"],
      minCGPA: 8.0,
      maxBacklogs: 0,
      batch: "2024",
    },
    skills: ["JavaScript", "Node.js", "React", "Data Structures"],
    applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    selectionProcess: ["Resume Screening", "Coding Test", "Technical Interview", "HR Interview"],
    status: "open",
    totalPositions: 5,
    postedBy: officerUser._id,
  });

  const jobMicrosoft = await Job.create({
    company: microsoft._id,
    title: "Cloud Software Engineer",
    description: "Work on cloud services and infrastructure.",
    jobType: "Full-time",
    location: "Hyderabad, India",
    package: { min: 18, max: 28 },
    eligibility: {
      departments: ["Computer Science", "Information Technology", "Electronics"],
      minCGPA: 7.5,
      maxBacklogs: 0,
      batch: "2024",
    },
    skills: ["C#", "Azure", "Distributed Systems", "SQL"],
    applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    driveDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    selectionProcess: ["Online Assessment", "Technical Interview", "HR Interview"],
    status: "open",
    totalPositions: 4,
    postedBy: officerUser._id,
  });

  await Application.create({
    student: studentProfile._id,
    job: jobGoogle._id,
    status: "applied",
    appliedAt: new Date(),
  });

  studentProfile.placementStatus = "placed";
  studentProfile.placedCompany = google._id;
  studentProfile.placedPackage = 25;
  await studentProfile.save();

  console.log("Demo data seeded successfully.");
};

module.exports = seedDemoData;
