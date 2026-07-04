const express = require("express");
const router = express.Router();
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getJobs);
router.get("/:id", getJob);
router.post("/", authorize("admin", "placement_officer"), createJob);
router.put("/:id", authorize("admin", "placement_officer"), updateJob);
router.delete("/:id", authorize("admin", "placement_officer"), deleteJob);

module.exports = router;
