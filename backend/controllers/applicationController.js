const Application = require("../models/Application");
const Student = require("../models/Student");
const Job = require("../models/Job");
const User = require("../models/User");
const sendEmail = require("../config/email");

// @desc    Apply to a job
// @route   POST /api/applications
const applyJob = async (req, res) => {
  try {
    const { jobId, studentId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status !== "open") {
      return res
        .status(400)
        .json({ success: false, message: "Job is not open for applications" });
    }

    if (new Date() > new Date(job.applicationDeadline)) {
      return res
        .status(400)
        .json({ success: false, message: "Application deadline has passed" });
    }

    const existingApp = await Application.findOne({
      student: studentId,
      job: jobId,
    });
    if (existingApp) {
      return res
        .status(400)
        .json({ success: false, message: "Already applied to this job" });
    }

    const application = await Application.create({
      student: studentId,
      job: jobId,
    });
    const populated = await Application.findById(application._id)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .populate({ path: "job", populate: { path: "company", select: "name" } });

    // EMAIL NOTIFICATION
    sendEmail({
      to: populated.student.user.email,
      subject: "Application Submitted Successfully ✅",
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f4f4f4;">
          <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto;">
            <h2 style="color: #3B82F6;">🎓 Application Confirmed!</h2>
            <p>Hi <strong>${populated.student.user.name}</strong>,</p>
            <p>Your application for <strong>${populated.job.title}</strong> 
               at <strong>${populated.job.company.name}</strong> has been submitted successfully.</p>
            <p>We'll notify you about the next steps. Good luck! 🚀</p>
            <hr>
            <p style="color: #888; font-size: 12px;">ERP Placement System</p>
          </div>
        </div>
      `,
    });

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all applications
// @route   GET /api/applications
const getApplications = async (req, res) => {
  try {
    const { jobId, studentId, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (jobId) query.job = jobId;
    if (studentId) query.student = studentId;
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "job",
        populate: { path: "company", select: "name industry" },
      })
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      count: applications.length,
      total,
      pages: Math.ceil(total / limit),
      data: applications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
const updateApplication = async (req, res) => {
  try {
    const { status, interviewDate, feedback, package: pkg, rounds } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, interviewDate, feedback, package: pkg, rounds },
      { new: true },
    )
      .populate({
        path: "student",
        populate: { path: "user", select: "name email" },
      })
      .populate({ path: "job", populate: { path: "company", select: "name" } });

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // STATUS EMAIL
    const statusMessages = {
      shortlisted: { subject: "🎉 You've been Shortlisted!", color: "#F59E0B" },
      selected: {
        subject: "🎊 Congratulations! You're Selected!",
        color: "#10B981",
      },
      rejected: { subject: "Application Update", color: "#EF4444" },
      interview_scheduled: {
        subject: "📅 Interview Scheduled",
        color: "#6366F1",
      },
    };

    if (statusMessages[status]) {
      sendEmail({
        to: application.student.user.email,
        subject: statusMessages[status].subject,
        html: `
          <div style="font-family: Arial; padding: 20px; background: #f4f4f4;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto;">
              <h2 style="color: ${statusMessages[status].color};">${statusMessages[status].subject}</h2>
              <p>Hi <strong>${application.student.user.name}</strong>,</p>
              <p>Your application status for <strong>${application.job.title}</strong> 
                 at <strong>${application.job.company.name}</strong> has been updated to: 
                 <strong>${status.replace("_", " ").toUpperCase()}</strong></p>
              ${status === "selected" ? `<p>Package: <strong>${pkg} LPA</strong> 🎉</p>` : ""}
              <hr>
              <p style="color: #888; font-size: 12px;">ERP Placement System</p>
            </div>
          </div>
        `,
      });
    }

    if (status === "selected") {
      const job = await Job.findById(application.job._id).populate("company");
      await Student.findByIdAndUpdate(application.student._id, {
        placementStatus: "placed",
        placedCompany: job.company._id,
        placedPackage: pkg || application.package,
      });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "withdrawn" },
      { new: true },
    );

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    res.json({
      success: true,
      message: "Application withdrawn",
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyJob,
  getApplications,
  updateApplication,
  withdrawApplication,
};
