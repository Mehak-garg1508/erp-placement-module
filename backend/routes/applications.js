const express = require("express");
const router = express.Router();
const {
  applyJob,
  getApplications,
  updateApplication,
  withdrawApplication,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.post("/", applyJob);
router.get("/", getApplications);
router.put("/:id", authorize("admin", "placement_officer"), updateApplication);
router.delete("/:id", withdrawApplication);

module.exports = router;
