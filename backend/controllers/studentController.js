const Student = require("../models/Student");
const User = require("../models/User");
const ExcelJS = require("exceljs");

// @desc    Get all students
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    const {
      department,
      batch,
      placementStatus,
      minCGPA,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const query = {};
    if (department) query.department = department;
    if (batch) query.batch = batch;
    if (placementStatus) query.placementStatus = placementStatus;
    if (minCGPA) query.cgpa = { $gte: parseFloat(minCGPA) };

    if (search) {
      query.$or = [
        { rollNumber: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(query)
      .populate("user", "name email")
      .populate("placedCompany", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      count: students.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "name email")
      .populate("placedCompany", "name industry");

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const {
      cgpa,
      skills,
      phone,
      address,
      linkedin,
      github,
      backlogsCount,
      tenthPercent,
      twelfthPercent,
      graduationPercent,
    } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        cgpa,
        skills,
        phone,
        address,
        linkedin,
        github,
        backlogsCount,
        tenthPercent,
        twelfthPercent,
        graduationPercent,
        ...(req.file && { resumeUrl: `/uploads/${req.file.filename}` }),
      },
      { new: true, runValidators: true },
    ).populate("user", "name email");

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get placement statistics
// @route   GET /api/students/stats
const getPlacementStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({
      placementStatus: "placed",
    });
    const optedOut = await Student.countDocuments({
      placementStatus: "opted_out",
    });

    const avgPackageResult = await Student.aggregate([
      {
        $match: { placementStatus: "placed", placedPackage: { $exists: true } },
      },
      { $group: { _id: null, avg: { $avg: "$placedPackage" } } },
    ]);

    const highestPackageResult = await Student.aggregate([
      {
        $match: { placementStatus: "placed", placedPackage: { $exists: true } },
      },
      { $group: { _id: null, max: { $max: "$placedPackage" } } },
    ]);

    const departmentWise = await Student.aggregate([
      { $group: { _id: "$department", total: { $sum: 1 } } },
    ]);

    const placedByDept = await Student.aggregate([
      { $match: { placementStatus: "placed" } },
      { $group: { _id: "$department", placed: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        placedStudents,
        optedOut,
        notPlaced: totalStudents - placedStudents - optedOut,
        placementRate:
          totalStudents > 0
            ? ((placedStudents / (totalStudents - optedOut)) * 100).toFixed(2)
            : 0,
        avgPackage: avgPackageResult[0]?.avg?.toFixed(2) || 0,
        highestPackage: highestPackageResult[0]?.max || 0,
        departmentWise,
        placedByDept,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export students to Excel
// @route   GET /api/students/export
const exportStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("user", "name email")
      .populate("placedCompany", "name");

    // Excel workbook banao
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    // Column headers define karo
    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Roll Number", key: "rollNumber", width: 15 },
      { header: "Email", key: "email", width: 30 },
      { header: "Department", key: "department", width: 20 },
      { header: "Batch", key: "batch", width: 10 },
      { header: "CGPA", key: "cgpa", width: 10 },
      { header: "Backlogs", key: "backlogs", width: 10 },
      { header: "Status", key: "status", width: 15 },
      { header: "Company", key: "company", width: 20 },
      { header: "Package (LPA)", key: "package", width: 15 },
    ];

    // Header styling (bold + color)
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    };

    // Data rows add karo
    students.forEach((student) => {
      worksheet.addRow({
        name: student.user?.name,
        rollNumber: student.rollNumber,
        email: student.user?.email,
        department: student.department,
        batch: student.batch,
        cgpa: student.cgpa,
        backlogs: student.backlogsCount,
        status: student.placementStatus,
        company: student.placedCompany?.name || "-",
        package: student.placedPackage || "-",
      });
    });

    // Response headers set karo (file download ke liye)
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=students_report.xlsx",
    );

    // Excel file bhejo
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudent,
  updateStudent,
  getPlacementStats,
  exportStudents,
};
