import React, { useEffect, useState } from "react";
import { getStudentsAPI } from "../../api/axios"; // Single import
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CardSkeleton } from "../../components/common/Skeleton"; // Loader add karo

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: "",
    batch: "",
    placementStatus: "",
    minCGPA: "",
    page: 1,
    search: "", // ➕ Added
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  // Temporarily disable export functionality
  const handleExport = async () => {
    toast.error("Export feature is coming soon!"); // Ya console log karo
    // Actual export code yahan add karenge backend ready hone par
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== ""),
      );
      const { data } = await getStudentsAPI(params);
      setStudents(data.data);
      setPagination({ total: data.total, pages: data.pages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const statusBadge = (status) => {
    const colors = {
      placed: "bg-green-100 text-green-700",
      not_placed: "bg-red-100 text-red-700",
      opted_out: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${colors[status] || "bg-gray-100 text-gray-700"}`}
      >
        {status?.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Students
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-300">
          Total: {pagination.total || 0}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search student..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none 
                      bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition"
        >
          📊 Export
        </button>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm">
        <select
          name="department"
          value={filters.department}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="">All Departments</option>
          {[
            "Computer Science",
            "Information Technology",
            "Electronics",
            "Mechanical",
          ].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="batch"
          value={filters.batch}
          onChange={handleFilterChange}
          placeholder="Batch"
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />

        <select
          name="placementStatus"
          value={filters.placementStatus}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="placed">Placed</option>
          <option value="not_placed">Not Placed</option>
        </select>

        <input
          type="number"
          name="minCGPA"
          value={filters.minCGPA}
          onChange={handleFilterChange}
          placeholder="Min CGPA"
          step="0.1"
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        {loading ? (
          <CardSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {[
                    "Student",
                    "Roll No",
                    "Department",
                    "Batch",
                    "CGPA",
                    "Backlogs",
                    "Status",
                    "Company",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 dark:text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-400">
                      No data found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                          {student.user?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.user?.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {student.rollNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {student.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {student.batch}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-semibold ${student.cgpa >= 8 ? "text-green-600" : student.cgpa >= 6 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {student.cgpa}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">
                        {student.backlogsCount}
                      </td>
                      <td className="px-4 py-3">
                        {statusBadge(student.placementStatus)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {student.placedCompany?.name || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/students/${student._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-300">
              Page {filters.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page === pagination.pages}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
