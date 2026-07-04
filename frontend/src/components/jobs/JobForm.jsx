import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createJobAPI,
  updateJobAPI,
  getJobAPI,
  getCompaniesAPI,
} from "../../api/axios";
import toast from "react-hot-toast";

const DEPARTMENTS = [
  "All",
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "MBA",
  "MCA",
];

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company: "",
    title: "",
    description: "",
    jobType: "Full-time",
    location: "",
    package: { min: "", max: "" },
    eligibility: {
      departments: ["All"],
      minCGPA: 6,
      maxBacklogs: 0,
      batch: "",
    },
    skills: "",
    applicationDeadline: "",
    driveDate: "",
    selectionProcess: "",
    status: "upcoming",
    totalPositions: 1,
  });

  useEffect(() => {
    fetchCompanies();
    if (isEdit) fetchJob();
  }, [id]);

  const fetchCompanies = async () => {
    try {
      const { data } = await getCompaniesAPI({ isActive: true, limit: 100 });
      setCompanies(data.data);
    } catch {}
  };

  const fetchJob = async () => {
    try {
      const { data } = await getJobAPI(id);
      const job = data.data;
      setForm({
        ...job,
        company: job.company?._id,
        skills: job.skills?.join(", "),
        selectionProcess: job.selectionProcess?.join(", "),
        applicationDeadline: job.applicationDeadline?.split("T")[0],
        driveDate: job.driveDate?.split("T")[0] || "",
      });
    } catch {
      toast.error("Failed to load job");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setForm({ ...form, [parent]: { ...form[parent], [child]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleDeptChange = (dept) => {
    const depts = form.eligibility.departments;
    const updated = depts.includes(dept)
      ? depts.filter((d) => d !== dept)
      : [...depts, dept];
    setForm({
      ...form,
      eligibility: { ...form.eligibility, departments: updated },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        selectionProcess: form.selectionProcess
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (isEdit) {
        await updateJobAPI(id, payload);
        toast.success("Job updated successfully!");
      } else {
        await createJobAPI(payload);
        toast.success("Job created successfully!");
      }
      navigate("/jobs");
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Edit Job" : "Post New Job"}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-5"
      >
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company *
            </label>
            <select
              name="company"
              value={form.company}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Software Engineer"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Describe the role, responsibilities..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <select
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option>Full-time</option>
              <option>Internship</option>
              <option>Contract</option>
              <option>Part-time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="Bangalore, India"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="upcoming">Upcoming</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Package */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Package (LPA)
            </label>
            <input
              type="number"
              name="package.min"
              value={form.package?.min || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Package (LPA)
            </label>
            <input
              type="number"
              name="package.max"
              value={form.package?.max || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Positions
            </label>
            <input
              type="number"
              name="totalPositions"
              value={form.totalPositions}
              onChange={handleChange}
              min={1}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Eligibility */}
        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Eligibility Criteria
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Min CGPA
              </label>
              <input
                type="number"
                name="eligibility.minCGPA"
                value={form.eligibility?.minCGPA}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="10"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Max Backlogs
              </label>
              <input
                type="number"
                name="eligibility.maxBacklogs"
                value={form.eligibility?.maxBacklogs}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Batch</label>
              <input
                type="text"
                name="eligibility.batch"
                value={form.eligibility?.batch || ""}
                onChange={handleChange}
                placeholder="2024"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">
              Eligible Departments
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => handleDeptChange(dept)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    form.eligibility?.departments?.includes(dept)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills & Process */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Required Skills (comma separated)
          </label>
          <input
            type="text"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="Java, Spring Boot, SQL, REST APIs"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selection Process (comma separated)
          </label>
          <input
            type="text"
            name="selectionProcess"
            value={form.selectionProcess}
            onChange={handleChange}
            placeholder="Aptitude Test, Technical Interview, HR Interview"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Deadline *
            </label>
            <input
              type="date"
              name="applicationDeadline"
              value={form.applicationDeadline}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drive Date
            </label>
            <input
              type="date"
              name="driveDate"
              value={form.driveDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : isEdit ? (
              "Update Job"
            ) : (
              "Post Job"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
