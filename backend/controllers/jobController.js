const Job = require("../models/Job");
const Student = require("../models/Student");

// @desc    Get all jobs
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const {
      status,
      company,
      jobType,
      page = 1,
      limit = 10,
      studentId,
    } = req.query;
    const query = {};
    if (status) query.status = status;
    if (company) query.company = company;
    if (jobType) query.jobType = jobType;

    // If studentId passed, filter eligible jobs for that student
    if (studentId) {
      const student = await Student.findById(studentId);
      if (student) {
        query["eligibility.minCGPA"] = { $lte: student.cgpa };
        query["eligibility.maxBacklogs"] = { $gte: student.backlogsCount };
        query.$or = [
          { "eligibility.departments": "All" },
          { "eligibility.departments": student.department },
        ];
        if (student.batch) {
          query.$or.push({ "eligibility.batch": student.batch });
        }
      }
    }

    const jobs = await Job.find(query)
      .populate("company", "name industry logoUrl")
      .populate("postedBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limit),
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("company", "name industry website description contactPerson")
      .populate("postedBy", "name email");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create job
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    const populatedJob = await Job.findById(job._id).populate(
      "company",
      "name industry",
    );
    res.status(201).json({ success: true, data: populatedJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("company", "name industry");

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getJobs, getJob, createJob, updateJob, deleteJob };
