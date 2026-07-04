import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Sidebar from "./components/common/Sidebar";
import Navbar from "./components/common/Navbar";
import Login from "./pages/Login";
import Dashboard from "./components/dashboard/Dashboard";
import StudentList from "./components/students/StudentList";
import StudentProfile from "./components/students/StudentProfile";
import CompanyList from "./components/companies/CompanyList";
import CompanyForm from "./components/companies/CompanyForm";
import JobList from "./components/jobs/JobList";
import JobForm from "./components/jobs/JobForm";
import ApplicationList from "./components/applications/ApplicationList";

// Layout wrapper for authenticated pages
// const AppLayout = ({ title }) => (
//   <div className="flex min-h-screen bg-gray-50">
//     <Sidebar />
//     <div className="flex-1 ml-64">
//       <Navbar title={title} />
//       <main>
//         <Outlet />
//       </main>
//     </div>
//   </div>
// );

const AppLayout = ({ title }) => (
  <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <Sidebar />
    <div className="flex-1 ml-64">
      <Navbar title={title} />
      <main>
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "12px", fontSize: "14px" },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout title="Dashboard" />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route
            element={
              <ProtectedRoute roles={["admin", "placement_officer"]}>
                <AppLayout title="Students" />
              </ProtectedRoute>
            }
          >
            <Route path="/students" element={<StudentList />} />
            <Route path="/students/:id" element={<StudentProfile />} />
          </Route>

          <Route
            element={
              <ProtectedRoute roles={["admin", "placement_officer"]}>
                <AppLayout title="Companies" />
              </ProtectedRoute>
            }
          >
            <Route path="/companies" element={<CompanyList />} />
            <Route path="/companies/new" element={<CompanyForm />} />
            <Route path="/companies/:id/edit" element={<CompanyForm />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <AppLayout title="Jobs" />
              </ProtectedRoute>
            }
          >
            <Route path="/jobs" element={<JobList />} />
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute roles={["admin", "placement_officer"]}>
                  <JobForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id/edit"
              element={
                <ProtectedRoute roles={["admin", "placement_officer"]}>
                  <JobForm />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            element={
              <ProtectedRoute roles={["admin", "placement_officer"]}>
                <AppLayout title="Applications" />
              </ProtectedRoute>
            }
          >
            <Route path="/applications" element={<ApplicationList />} />
          </Route>

          {/* Student specific */}
          <Route
            element={
              <ProtectedRoute roles={["student"]}>
                <AppLayout title="My Applications" />
              </ProtectedRoute>
            }
          >
            <Route
              path="/my-applications"
              element={<ApplicationList studentOnly />}
            />
          </Route>

          <Route
            element={
              <ProtectedRoute roles={["student"]}>
                <AppLayout title="My Profile" />
              </ProtectedRoute>
            }
          >
            <Route path="/profile" element={<StudentProfile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
