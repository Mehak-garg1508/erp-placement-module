import React, { useEffect, useState } from "react";
import {
  getApplicationsAPI,
  updateApplicationAPI,
  withdrawApplicationAPI,
} from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const APPLICATION_STATUSES = [
  "applied",
  "shortlisted",
  "aptitude_cleared",
  "interview_scheduled",
  "selected",
  "rejected",
  "withdrawn",
];

const statusColors = {
  applied: "bg-blue-100 text-blue-700",
  shortlisted: "bg-yellow-100 text-yellow-700",
  aptitude_cleared: "bg-purple-100 text-purple-700",
  interview_scheduled: "bg-indigo-100 text-indigo-700",
  selected: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-700",
};

const ApplicationList = ({ studentOnly = false }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", page: 1 });
  const [pagination, setPagination] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const isAdmin = ["admin", "placement_officer"].includes(user?.role);
  const studentId = user?.studentProfile?._id;

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (studentOnly && studentId) params.studentId = studentId;
      if (!params.status) delete params.status;

      const { data } = await getApplicationsAPI(params);
      setApplications(data.data);
      setPagination({ total: data.total, pages: data.pages });
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus, pkg) => {
    setUpdatingId(id);
    try {
      await updateApplicationAPI(id, { status: newStatus, package: pkg });
      toast.success("Status updated!");
      fetchApplications();
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm("Withdraw this application?")) return;
    try {
      await withdrawApplicationAPI(id);
      toast.success("Application withdrawn");
      fetchApplications();
    } catch {
      toast.error("Withdraw failed");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {studentOnly ? "My Applications" : "All Applications"}
        </h2>
        <span className="text-sm text-gray-500">
          Total: {pagination.total || 0}
        </span>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Status</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    !studentOnly && "Student",
                    "Job",
                    "Company",
                    "Applied On",
                    "Status",
                    "Actions",
                  ]
                    .filter(Boolean)
                    .map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3"
                      >
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {!studentOnly && (
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-sm text-gray-800">
                            {app.student?.user?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {app.student?.rollNumber}
                          </p>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-800">
                        {app.job?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {app.job?.jobType}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {app.job?.company?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          statusColors[app.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {app.status?.replace(/_/g, " ")}
                      </span>
                      {app.package && (
                        <p className="text-xs text-green-600 mt-0.5">
                          {app.package} LPA
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isAdmin &&
                          app.status !== "selected" &&
                          app.status !== "rejected" && (
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleStatusUpdate(app._id, e.target.value)
                              }
                              disabled={updatingId === app._id}
                              className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                              {APPLICATION_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.replace("_", " ")}
                                </option>
                              ))}
                            </select>
                          )}

                        {!isAdmin && app.status === "applied" && (
                          <button
                            onClick={() => handleWithdraw(app._id)}
                            className="text-xs text-red-600 border border-red-300 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {applications.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No applications found
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-4 py-2 text-sm disabled:opacity-40 hover:bg-gray-100 rounded-lg"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              {filters.page} / {pagination.pages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.pages}
              className="px-4 py-2 text-sm disabled:opacity-40 hover:bg-gray-100 rounded-lg"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationList;
