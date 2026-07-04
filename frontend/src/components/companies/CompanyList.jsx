import React, { useEffect, useState } from "react";
import { getCompaniesAPI, deleteCompanyAPI } from "../../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const CompanyList = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ industry: "", page: 1 });
  const [pagination, setPagination] = useState({});

  const isAdmin = ["admin", "placement_officer"].includes(user?.role);

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== ""),
      );
      const { data } = await getCompaniesAPI(params);
      setCompanies(data.data);
      setPagination({ total: data.total, pages: data.pages });
    } catch {
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    try {
      await deleteCompanyAPI(id);
      toast.success("Company deleted");
      fetchCompanies();
    } catch {
      toast.error("Delete failed");
    }
  };

  const industries = [
    "IT",
    "Finance",
    "Healthcare",
    "Manufacturing",
    "Consulting",
    "E-commerce",
    "Startup",
    "Government",
    "Other",
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Companies</h2>
        {isAdmin && (
          <Link
            to="/companies/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            + Add Company
          </Link>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <select
          value={filters.industry}
          onChange={(e) =>
            setFilters({ ...filters, industry: e.target.value, page: 1 })
          }
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Industries</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <div
              key={company._id}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {company.name}
                  </h3>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {company.industry}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    company.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {company.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {company.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {company.description}
                </p>
              )}

              {company.contactPerson?.name && (
                <div className="text-xs text-gray-500 mb-3">
                  <span className="font-medium">Contact: </span>
                  {company.contactPerson.name} •{" "}
                  {company.contactPerson.designation}
                </div>
              )}

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline block mb-3"
                >
                  🌐 {company.website}
                </a>
              )}

              {isAdmin && (
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    to={`/companies/${company._id}/edit`}
                    className="flex-1 text-center text-sm text-yellow-600 border border-yellow-300 py-1.5 rounded-xl hover:bg-yellow-50 transition"
                  >
                    Edit
                  </Link>
                  {user.role === "admin" && (
                    <button
                      onClick={() => handleDelete(company._id)}
                      className="flex-1 text-sm text-red-600 border border-red-300 py-1.5 rounded-xl hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && companies.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🏢</div>
          <p>No companies found</p>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
