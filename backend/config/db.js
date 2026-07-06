const mongoose = require("mongoose");
const User = require("../models/User");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    const defaultEmails = [
      "admin@erp.com",
      "officer@erp.com",
      "student@erp.com",
    ];
    const existingUsers = await User.find({
      email: { $in: defaultEmails },
    }).select("email");
    const existingEmails = new Set(existingUsers.map((user) => user.email));

    const missingUsers = defaultEmails
      .filter((email) => !existingEmails.has(email))
      .map((email) => {
        if (email === "admin@erp.com") {
          return {
            name: "System Admin",
            email,
            password: "admin123",
            role: "admin",
          };
        }
        if (email === "officer@erp.com") {
          return {
            name: "Placement Officer",
            email,
            password: "officer123",
            role: "placement_officer",
          };
        }
        return {
          name: "Jane Student",
          email,
          password: "student123",
          role: "student",
        };
      });

    if (missingUsers.length > 0) {
      console.log("Creating missing default demo accounts...");
      await User.create(missingUsers);
      console.log("Default demo accounts created successfully.");
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
