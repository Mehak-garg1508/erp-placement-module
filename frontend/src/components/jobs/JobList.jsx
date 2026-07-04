import React, { useEffect, useState } from "react";
import {
  getJobsAPI,
  deleteJobAPI,
  applyJobAPI,
  getApplicationsAPI,
} from "../../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const JobList = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [filters, setFilters] = useState({
    status: "open",
    jobType: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({});

  const isAdmin = ["admin", "placement_officer"].includes(user?.role);
  const studentId = user?.studentProfile?._id;

  useEffect(() => {
    fetchJobs();
    if (studentId) fetchAppliedJobs();
  }, [filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!isAdmin) params.studentId = studentId;
      const { data } = await getJobsAPI(params);
      setJobs(data.data);
      setPagination({ total: data.total, pages: data.pages });
    } catch {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const { data } = await getApplicationsAPI({ studentId });
      const ids = new Set(data.data.map((a) => a.job?._id));
      setAppliedJobs(ids);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await deleteJobAPI(id);
      toast.success("Job deleted");
      fetchJobs();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleApply = async (jobId) => {
    try {
      await applyJobAPI({ jobId, studentId });
      toast.success("Applied successfully!");
      setAppliedJobs((prev) => new Set([...prev, jobId]));
    } catch (error) {
      toast.error(error.response?.data?.message || "Application failed");
    }
  };

  const statusColors = {
    open: "bg-green-100 text-green-700",
    closed: "bg-red-100 text-red-700",
    upcoming: "bg-yellow-100 text-yellow-700",
    completed: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isAdmin ? "All Jobs" : "Available Jobs"}
        </h2>
        {isAdmin && (
          <Link
            to="/jobs/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>+</span> Post Job
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filters.jobType}
            onChange={(e) =>
              setFilters({ ...filters, jobType: e.target.value, page: 1 })
            }
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-base">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500">{job.company?.name}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    statusColors[job.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {job.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <span>📍</span> {job.location}
                </div>
                <div className="flex items-center gap-2">
                  <span>💼</span> {job.jobType}
                </div>
                <div className="flex items-center gap-2">
                  <span>💰</span> {job.package?.min} - {job.package?.max} LPA
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span> Deadline:{" "}
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <span>🎯</span> Min CGPA: {job.eligibility?.minCGPA}
                </div>
              </div>

              {/* Skills */}
              {job.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {job.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{job.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/jobs/${job._id}`}
                  className="flex-1 text-center border border-blue-600 text-blue-600 py-2 rounded-xl text-sm hover:bg-blue-50 transition"
                >
                  Details
                </Link>

                {!isAdmin && job.status === "open" && (
                  <button
                    onClick={() => handleApply(job._id)}
                    disabled={appliedJobs.has(job._id)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                      appliedJobs.has(job._id)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {appliedJobs.has(job._id) ? "Applied ✓" : "Apply"}
                  </button>
                )}

                {isAdmin && (
                  <>
                    <Link
                      to={`/jobs/${job._id}/edit`}
                      className="px-3 py-2 text-yellow-600 border border-yellow-300 rounded-xl text-sm hover:bg-yellow-50 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="px-3 py-2 text-red-600 border border-red-300 rounded-xl text-sm hover:bg-red-50 transition"
                    >
                      Del
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">💼</div>
          <p>No jobs found</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
            className="px-4 py-2 text-sm border rounded-xl disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {filters.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page === pagination.pages}
            className="px-4 py-2 text-sm border rounded-xl disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default JobList;
