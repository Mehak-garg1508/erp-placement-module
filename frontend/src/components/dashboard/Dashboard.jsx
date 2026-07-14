import React, { useEffect, useState } from "react";
import {
  getPlacementStatsAPI,
  getJobsAPI,
  getApplicationsAPI,
} from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
  </div>
);

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (user.role !== "student") {
        const [statsRes, jobsRes, appsRes] = await Promise.all([
          getPlacementStatsAPI(),
          getJobsAPI({ limit: 5, status: "open" }),
          getApplicationsAPI({ limit: 5 }),
        ]);
        setStats(statsRes.data.data);
        setRecentJobs(jobsRes.data.data);
        setRecentApps(appsRes.data.data);
      } else {
        const [jobsRes, appsRes] = await Promise.all([
          getJobsAPI({ limit: 5, status: "open" }),
          getApplicationsAPI({
            studentId: user.studentProfile?._id,
            limit: 5,
          }),
        ]);
        setRecentJobs(jobsRes.data.data);
        setRecentApps(appsRes.data.data);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const placementPieData = stats
    ? [
        { name: "Placed", value: stats.placedStudents },
        { name: "Not Placed", value: stats.notPlaced },
        { name: "Opted Out", value: stats.optedOut },
      ]
    : [];

  const deptBarData =
    stats?.placedByDept?.map((d) => ({
      name: d._id?.split(" ")[0],
      placed: d.placed,
    })) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-500">Welcome back, {user.name}!</p>
      </div>

      {/* Admin / Officer Stats */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon="👨‍🎓"
              color="border-blue-500"
            />
            <StatCard
              title="Students Placed"
              value={stats.placedStudents}
              subtitle={`${stats.placementRate}% placement rate`}
              icon="✅"
              color="border-green-500"
            />
            <StatCard
              title="Avg Package"
              value={`${stats.avgPackage} LPA`}
              icon="💰"
              color="border-yellow-500"
            />
            <StatCard
              title="Highest Package"
              value={`${stats.highestPackage} LPA`}
              icon="🏆"
              color="border-purple-500"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Placement Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={placementPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {placementPieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Placements by Department
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptBarData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="placed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Student Stats */}
      {user.role === "student" && user.studentProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Your CGPA"
            value={user.studentProfile.cgpa}
            icon="📚"
            color="border-blue-500"
          />
          <StatCard
            title="Applications"
            value={recentApps.length}
            icon="📋"
            color="border-green-500"
          />
          <StatCard
            title="Placement Status"
            value={
              user.studentProfile.placementStatus === "placed"
                ? "Placed ✅"
                : "Not Placed"
            }
            icon="💼"
            color={
              user.studentProfile.placementStatus === "placed"
                ? "border-green-500"
                : "border-red-500"
            }
          />
        </div>
      )}

      {/* Recent Jobs & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Open Jobs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Open Jobs
          </h3>
          {recentJobs.length === 0 ? (
            <p className="text-gray-400 text-sm">No open jobs currently</p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {job.company?.name} • {job.location}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {job.package?.min} - {job.package?.max} LPA
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Applications
          </h3>
          {recentApps.length === 0 ? (
            <p className="text-gray-400 text-sm">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {app.job?.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.role !== "student" &&
                        `${app.student?.user?.name} • `}
                      {app.job?.company?.name}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                      app.status === "selected"
                        ? "bg-green-100 text-green-700"
                        : app.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : app.status === "shortlisted"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
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
  );
};

export default Dashboard;
