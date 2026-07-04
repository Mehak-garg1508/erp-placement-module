const express = require("express");
const router = express.Router();
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getCompanies);
router.get("/:id", getCompany);
router.post("/", authorize("admin", "placement_officer"), createCompany);
router.put("/:id", authorize("admin", "placement_officer"), updateCompany);
router.delete("/:id", authorize("admin"), deleteCompany);

module.exports = router;
