// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const path = require("path");
// const connectDB = require("./config/db");
// const fs = require("fs");

// dotenv.config();
// connectDB();

// const app = express();

// // Create uploads directory
// if (!fs.existsSync("uploads")) {
//   fs.mkdirSync("uploads");
// }

// // Middleware
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Routes
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/students", require("./routes/students"));
// app.use("/api/companies", require("./routes/companies"));
// app.use("/api/jobs", require("./routes/jobs"));
// app.use("/api/applications", require("./routes/applications"));

// // Health check
// app.get("/api/health", (req, res) => {
//   res.json({ status: "OK", message: "ERP Placement API is running" });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res
//     .status(500)
//     .json({ success: false, message: err.message || "Server Error" });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet"); // ← NEW
const rateLimit = require("express-rate-limit"); // ← NEW
const mongoSanitize = require("express-mongo-sanitize"); // ← NEW
const connectDB = require("./config/db");
const fs = require("fs");

dotenv.config();
connectDB();

const app = express();
app.set("trust proxy", 1);


if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ─── SECURITY MIDDLEWARE ──────────────────── (NEW SECTION)
app.use(helmet()); // Security headers set karta hai

// MongoDB injection attacks se bachata hai
app.use(mongoSanitize());

// Rate Limiting - API abuse rokna (Only in Production)
const limiter = process.env.NODE_ENV === "production"
  ? rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Har IP 15 min me max 100 requests
      message: "Too many requests, please try again later",
    })
  : (req, res, next) => next();
app.use("/api", limiter);

// Login pe strict limit (brute force attack rokna - Only in Production)
const loginLimiter = process.env.NODE_ENV === "production"
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5, // Max 5 login attempts
      message: "Too many login attempts, try again after 15 minutes",
    })
  : (req, res, next) => next();
app.use("/api/auth/login", loginLimiter);
// ──────────────────────────────────────────────

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/students"));
app.use("/api/companies", require("./routes/companies"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "ERP Placement API is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ success: false, message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
