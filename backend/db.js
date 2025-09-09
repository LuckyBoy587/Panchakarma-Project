const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "panchakarma_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

// Initialize database connection
async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log("Database connected successfully");
    return pool;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

module.exports = { initializeDatabase, getPool: () => pool };
