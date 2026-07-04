import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStudentAPI,
  updateStudentAPI,
  getApplicationsAPI,
} from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const StudentProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  const studentId = id || user?.studentProfile?._id;

  useEffect(() => {
    if (studentId) fetchData();
  }, [studentId]);

  const fetchData = async () => {
    try {
      const [studentRes, appsRes] = await Promise.all([
        getStudentAPI(studentId),
        getApplicationsAPI({ studentId }),
      ]);
      setStudent(studentRes.data.data);
      setFormData(studentRes.data.data);
      setApplications(appsRes.data.data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "skills") {
          fd.append(key, JSON.stringify(formData[key]));
        } else {
          fd.append(key, formData[key]);
        }
      });

      await updateStudentAPI(studentId, formData);
      toast.success("Profile updated!");
      setEditing(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(",").map((s) => s.trim());
    setFormData({ ...formData, skills });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!student)
    return (
      <div className="p-6 text-center text-gray-500">Student not found</div>
    );

  const statusColors = {
    applied: "bg-blue-100 text-blue-700",
    shortlisted: "bg-yellow-100 text-yellow-700",
    selected: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
        <div className="flex gap-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {student.user?.name?.charAt(0)}
          </div>
          <h3 className="text-lg font-bold text-gray-800">
            {student.user?.name}
          </h3>
          <p className="text-gray-500 text-sm">{student.user?.email}</p>
          <p className="text-blue-600 font-semibold mt-1">
            {student.rollNumber}
          </p>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Department</span>
              <span className="font-medium">{student.department}</span>
            </div>
            <div className="flex justify-between">
              <span>Batch</span>
              <span className="font-medium">{student.batch}</span>
            </div>
            <div className="flex justify-between">
              <span>CGPA</span>
              <span className="font-semibold text-blue-600">
                {student.cgpa}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Backlogs</span>
              <span className="font-medium">{student.backlogsCount}</span>
            </div>
          </div>

          <div className="mt-4">
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                student.placementStatus === "placed"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {student.placementStatus?.replace("_", " ").toUpperCase()}
            </span>
          </div>

          {student.placementStatus === "placed" && (
            <div className="mt-3 p-3 bg-green-50 rounded-xl">
              <p className="text-xs text-green-700 font-semibold">
                🎉 Placed at {student.placedCompany?.name}
              </p>
              <p className="text-xs text-green-600">
                Package: {student.placedPackage} LPA
              </p>
            </div>
          )}

          {student.skills?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">SKILLS</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {student.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Form / Details */}
        <div className="lg:col-span-2 space-y-6">
          {editing ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Edit Profile
              </h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cgpa || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, cgpa: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills?.join(", ") || ""}
                    onChange={handleSkillsChange}
                    placeholder="Python, React, SQL..."
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, linkedin: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={formData.github || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, github: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      10th %
                    </label>
                    <input
                      type="number"
                      value={formData.tenthPercent || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tenthPercent: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      12th %
                    </label>
                    <input
                      type="number"
                      value={formData.twelfthPercent || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          twelfthPercent: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Graduation %
                    </label>
                    <input
                      type="number"
                      value={formData.graduationPercent || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          graduationPercent: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={2}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Academic Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "10th", value: `${student.tenthPercent || "-"}%` },
                  {
                    label: "12th",
                    value: `${student.twelfthPercent || "-"}%`,
                  },
                  {
                    label: "Graduation",
                    value: `${student.graduationPercent || "-"}%`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-blue-50 rounded-xl p-4 text-center"
                  >
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-xl font-bold text-blue-700">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {student.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📞</span> {student.phone}
                  </div>
                )}
                {student.linkedin && (
                  <a
                    href={student.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <span>🔗</span> LinkedIn
                  </a>
                )}
                {student.github && (
                  <a
                    href={student.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:underline"
                  >
                    <span>💻</span> GitHub
                  </a>
                )}
                {student.resumeUrl && (
                  <a
                    href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${student.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:underline"
                  >
                    <span>📄</span> View Resume
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Applications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Application History
            </h3>
            {applications.length === 0 ? (
              <p className="text-gray-400 text-sm">No applications found</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-sm">{app.job?.title}</p>
                      <p className="text-xs text-gray-500">
                        {app.job?.company?.name} •{" "}
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        statusColors[app.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {app.status?.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
