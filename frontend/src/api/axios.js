import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth
export const loginAPI = (data) => API.post("/auth/login", data);
export const registerAPI = (data) => API.post("/auth/register", data);
export const getMeAPI = () => API.get("/auth/me");

// Students
export const getStudentsAPI = (params) => API.get("/students", { params });
export const getStudentAPI = (id) => API.get(`/students/${id}`);
export const updateStudentAPI = (id, data) => API.put(`/students/${id}`, data);
export const getPlacementStatsAPI = () => API.get("/students/stats");

// Companies
export const getCompaniesAPI = (params) => API.get("/companies", { params });
export const getCompanyAPI = (id) => API.get(`/companies/${id}`);
export const createCompanyAPI = (data) => API.post("/companies", data);
export const updateCompanyAPI = (id, data) => API.put(`/companies/${id}`, data);
export const deleteCompanyAPI = (id) => API.delete(`/companies/${id}`);

// Jobs
export const getJobsAPI = (params) => API.get("/jobs", { params });
export const getJobAPI = (id) => API.get(`/jobs/${id}`);
export const createJobAPI = (data) => API.post("/jobs", data);
export const updateJobAPI = (id, data) => API.put(`/jobs/${id}`, data);
export const deleteJobAPI = (id) => API.delete(`/jobs/${id}`);

// Applications
export const applyJobAPI = (data) => API.post("/applications", data);
export const getApplicationsAPI = (params) =>
  API.get("/applications", { params });
export const updateApplicationAPI = (id, data) =>
  API.put(`/applications/${id}`, data);
export const withdrawApplicationAPI = (id) => API.delete(`/applications/${id}`);

export default API;
