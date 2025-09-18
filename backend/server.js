const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const { initializeDatabase } = require("./db");

// Import route modules
const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patients");
const practitionerRoutes = require("./routes/practitioners");
const therapistRoutes = require("./routes/therapists");
const appointmentRoutes = require("./routes/appointments");
const treatmentPlanRoutes = require("./routes/treatmentPlans");
const staffRoutes = require("./routes/staff");
const uploadRoutes = require("./routes/uploads");
const slotRoutes = require("./routes/slots");
const healthRoutes = require("./routes/health");
const therapiesRoutes = require("./routes/therapies");
const schedulerRoutes = require("./routes/scheduler");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/practitioners", practitionerRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/treatment-plans", treatmentPlanRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/therapies", therapiesRoutes);
app.use("/api/scheduler", schedulerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);

module.exports = app;
