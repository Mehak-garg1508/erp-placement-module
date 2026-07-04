const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load models
const User = require("../models/User");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const seedDatabase = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully!");

    // Clear old data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Student.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log("Database cleared!");

    // Create default Admin
    console.log("Creating default admin account...");
    const adminUser = await User.create({
      name: "System Admin",
      email: "admin@erp.com",
      password: "admin123",
      role: "admin",
    });

    // Create default Officer
    console.log("Creating default placement officer account...");
    const officerUser = await User.create({
      name: "Placement Officer",
      email: "officer@erp.com",
      password: "officer123",
      role: "placement_officer",
    });

    // Create default Student User
    console.log("Creating default student account...");
    const defaultStudentUser = await User.create({
      name: "Jane Student",
      email: "student@erp.com",
      password: "student123",
      role: "student",
    });

    const defaultStudentProfile = await Student.create({
      user: defaultStudentUser._id,
      rollNumber: "CS2020001",
      department: "Computer Science",
      batch: "2020-2024",
      cgpa: 8.9,
      backlogsCount: 0,
      skills: ["React", "Node.js", "Express", "MongoDB", "Python"],
      phone: "9876543210",
      address: "123 Campus Lane, Tech City",
      linkedin: "https://linkedin.com/in/janestudent",
      github: "https://github.com/janestudent",
    });

    // Create more students
    console.log("Creating mock students...");
    const studentData = [
      { name: "John Smith", email: "john@erp.com", password: "student123", rollNumber: "IT2020002", department: "Information Technology", cgpa: 7.8, batch: "2020-2024", skills: ["Java", "SQL", "Spring Boot"] },
      { name: "Emily Brown", email: "emily@erp.com", password: "student123", rollNumber: "EE2020003", department: "Electrical", cgpa: 8.2, batch: "2020-2024", skills: ["MATLAB", "IoT", "C++"] },
      { name: "Michael Green", email: "michael@erp.com", password: "student123", rollNumber: "ME2020004", department: "Mechanical", cgpa: 6.9, batch: "2020-2024", skills: ["AutoCAD", "Thermodynamics"] },
      { name: "David Wilson", email: "david@erp.com", password: "student123", rollNumber: "CE2020005", department: "Civil", cgpa: 7.1, batch: "2020-2024", skills: ["STAAD Pro", "Surveying"] },
      { name: "Jessica Taylor", email: "jessica@erp.com", password: "student123", rollNumber: "MB2022006", department: "MBA", cgpa: 9.1, batch: "2022-2024", skills: ["Marketing", "Excel", "Finance"] },
      { name: "Daniel Martinez", email: "daniel@erp.com", password: "student123", rollNumber: "MC2021007", department: "MCA", cgpa: 8.5, batch: "2021-2024", skills: ["React Native", "PHP", "Laravel"] },
      { name: "Sarah White", email: "sarahw@erp.com", password: "student123", rollNumber: "CS2020008", department: "Computer Science", cgpa: 9.5, batch: "2020-2024", skills: ["Go", "Docker", "Kubernetes", "AWS"] },
      { name: "James Davis", email: "james@erp.com", password: "student123", rollNumber: "EL2020009", department: "Electronics", cgpa: 7.4, batch: "2020-2024", skills: ["Verilog", "Embedded C"] },
    ];

    const students = [];
    for (const s of studentData) {
      const u = await User.create({
        name: s.name,
        email: s.email,
        password: s.password,
        role: "student",
      });
      const p = await Student.create({
        user: u._id,
        rollNumber: s.rollNumber,
        department: s.department,
        batch: s.batch,
        cgpa: s.cgpa,
        skills: s.skills,
        phone: "9988776655",
        address: "Campus Hostel A",
      });
      students.push(p);
    }

    // Create companies
    console.log("Creating mock companies...");
    const createdCompanies = await Company.insertMany([
      {
        name: "Google",
        industry: "IT",
        website: "https://google.com",
        description: "Google LLC is an American multinational technology company focusing on artificial intelligence, search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, and consumer electronics.",
        contactPerson: { name: "Alice HR", email: "alice@google.com", phone: "1234567890", designation: "University Recruiter" },
        address: "Mountain View, CA",
        visitHistory: [{ year: "2023", studentsPlaced: 4, avgPackage: 32, highestPackage: 45 }],
      },
      {
        name: "Microsoft",
        industry: "IT",
        website: "https://microsoft.com",
        description: "Microsoft Corporation is an American multinational technology corporation producing computer software, consumer electronics, personal computers, and services.",
        contactPerson: { name: "Bob Recruiter", email: "bob@microsoft.com", phone: "2345678901", designation: "HR Manager" },
        address: "Redmond, WA",
        visitHistory: [{ year: "2023", studentsPlaced: 6, avgPackage: 26, highestPackage: 38 }],
      },
      {
        name: "Amazon",
        industry: "E-commerce",
        website: "https://amazon.com",
        description: "Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, online advertising, digital streaming, and artificial intelligence.",
        contactPerson: { name: "Carol Talent", email: "carol@amazon.com", phone: "3456789012", designation: "Talent Advisor" },
        address: "Seattle, WA",
        visitHistory: [{ year: "2023", studentsPlaced: 5, avgPackage: 20, highestPackage: 30 }],
      },
      {
        name: "TCS",
        industry: "Consulting",
        website: "https://tcs.com",
        description: "Tata Consultancy Services is an Indian multinational information technology services and consulting company headquartered in Mumbai.",
        contactPerson: { name: "Dinesh Kumar", email: "dinesh@tcs.com", phone: "4567890123", designation: "Campus Lead" },
        address: "Mumbai, India",
        visitHistory: [{ year: "2023", studentsPlaced: 25, avgPackage: 4.5, highestPackage: 7.2 }],
      },
      {
        name: "Infosys",
        industry: "Consulting",
        website: "https://infosys.com",
        description: "Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.",
        contactPerson: { name: "Evelyn HR", email: "evelyn@infosys.com", phone: "5678901234", designation: "Recruiter" },
        address: "Bangalore, India",
        visitHistory: [{ year: "2023", studentsPlaced: 18, avgPackage: 4.2, highestPackage: 6.8 }],
      },
    ]);

    // Create jobs
    console.log("Creating mock jobs...");
    const jobs = await Job.insertMany([
      {
        company: createdCompanies[0]._id, // Google
        title: "Software Engineer",
        description: "As a Software Engineer, you will work on a specific project critical to Google’s needs with opportunities to switch teams and projects as you and our fast-paced business grow and evolve.",
        jobType: "Full-time",
        location: "Bangalore, India",
        package: { min: 20, max: 35 },
        eligibility: {
          departments: ["Computer Science", "Information Technology", "MCA"],
          minCGPA: 8.0,
          maxBacklogs: 0,
          batch: "2024",
        },
        skills: ["C++", "Java", "Python", "Data Structures", "Algorithms"],
        applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        driveDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        selectionProcess: ["Resume Screening", "Online Coding Challenge", "Technical Interview Round 1", "Technical Interview Round 2", "HR Round"],
        status: "open",
        totalPositions: 3,
        postedBy: officerUser._id,
      },
      {
        company: createdCompanies[1]._id, // Microsoft
        title: "Cloud Software Engineer",
        description: "Join the Azure Cloud team to build next-generation scalable cloud platforms and infrastructure.",
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
        applicationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        driveDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        selectionProcess: ["Online Test", "System Design Interview", "Coding Interview", "Manager Round"],
        status: "open",
        totalPositions: 5,
        postedBy: officerUser._id,
      },
      {
        company: createdCompanies[3]._id, // TCS
        title: "Systems Engineer",
        description: "Exciting entry-level position to kickstart your career in software development, maintenance, and support.",
        jobType: "Full-time",
        location: "PAN India",
        package: { min: 3.6, max: 7 },
        eligibility: {
          departments: ["All"],
          minCGPA: 6.0,
          maxBacklogs: 1,
          batch: "2024",
        },
        skills: ["Basic Programming", "Problem Solving", "Database Basics"],
        applicationDeadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Closed deadline
        driveDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        selectionProcess: ["TCS NQT Exam", "Technical Interview", "HR Interview"],
        status: "closed",
        totalPositions: 50,
        postedBy: officerUser._id,
      },
      {
        company: createdCompanies[2]._id, // Amazon
        title: "Business Analyst (Placement)",
        description: "Looking for an analytical mind to extract key insights, design business reports, and drive process optimization.",
        jobType: "Internship",
        location: "Bangalore, India",
        package: { min: 12, max: 18 },
        eligibility: {
          departments: ["MBA", "MCA", "Computer Science"],
          minCGPA: 7.0,
          maxBacklogs: 0,
          batch: "2024",
        },
        skills: ["SQL", "Excel", "Tableau", "PowerBI"],
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        driveDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        selectionProcess: ["Aptitude Test", "Case Study Round", "Bar Raiser Interview"],
        status: "open",
        totalPositions: 2,
        postedBy: officerUser._id,
      },
    ]);

    // Create applications and update student placement statuses
    console.log("Creating applications...");
    const applications = [];

    // Sarah White (student index 6) is a CS genius (CGPA: 9.5).
    // Let's place her at Google.
    const app1 = await Application.create({
      student: students[6]._id,
      job: jobs[0]._id, // Google SWE
      status: "selected",
      package: 32,
      appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      rounds: [
        { roundName: "Online coding", status: "cleared", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { roundName: "Technical 1", status: "cleared", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { roundName: "HR", status: "cleared", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ],
    });
    applications.push(app1);

    // Update Sarah White placement status
    students[6].placementStatus = "placed";
    students[6].placedCompany = createdCompanies[0]._id; // Google
    students[6].placedPackage = 32;
    await students[6].save();

    // Jessica Taylor (student index 4) is MBA (CGPA: 9.1).
    // Let's place her at Amazon Business Analyst.
    const app2 = await Application.create({
      student: students[4]._id,
      job: jobs[3]._id, // Amazon BA
      status: "selected",
      package: 15,
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      rounds: [
        { roundName: "Aptitude", status: "cleared", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { roundName: "Case study", status: "cleared", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ],
    });
    applications.push(app2);

    // Update Jessica Taylor placement status
    students[4].placementStatus = "placed";
    students[4].placedCompany = createdCompanies[2]._id; // Amazon
    students[4].placedPackage = 15;
    await students[4].save();

    // John Smith (student index 0) is IT (CGPA: 7.8).
    // Place him at TCS.
    const app3 = await Application.create({
      student: students[0]._id,
      job: jobs[2]._id, // TCS Systems Engineer
      status: "selected",
      package: 4.5,
      appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      rounds: [
        { roundName: "NQT", status: "cleared", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { roundName: "Technical & HR", status: "cleared", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      ],
    });
    applications.push(app3);

    students[0].placementStatus = "placed";
    students[0].placedCompany = createdCompanies[3]._id; // TCS
    students[0].placedPackage = 4.5;
    await students[0].save();

    // Default student (Jane Student) applied to Google and Microsoft
    const app4 = await Application.create({
      student: defaultStudentProfile._id,
      job: jobs[0]._id, // Google SWE
      status: "applied",
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });
    const app5 = await Application.create({
      student: defaultStudentProfile._id,
      job: jobs[1]._id, // Microsoft Cloud
      status: "interview_scheduled",
      interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });
    applications.push(app4, app5);

    // Some rejected applications
    const app6 = await Application.create({
      student: students[1]._id, // Emily Brown
      job: jobs[0]._id, // Google SWE (CS eligibility - but wait, she is EE and applied)
      status: "rejected",
      appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      feedback: "Failed to meet minimum CGPA and coding exam criteria for Google software role.",
    });
    applications.push(app6);

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
