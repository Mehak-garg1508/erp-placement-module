const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudent,
  updateStudent,
  getPlacementStats,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const ExcelJS = require("exceljs"); // File ke top pe add karo

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

// Export me add karo
module.exports = {
  getStudents,
  getStudent,
  updateStudent,
  getPlacementStats,
  exportStudents, // ← NEW
};

router.use(protect);

router.get(
  "/stats",
  authorize("admin", "placement_officer"),
  getPlacementStats,
);
router.get("/", authorize("admin", "placement_officer"), getStudents);
router.get("/:id", getStudent);
router.put("/:id", upload.single("resume"), updateStudent);

module.exports = router;
