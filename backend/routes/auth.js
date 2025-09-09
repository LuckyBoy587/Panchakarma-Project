const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { getPool } = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, userType } = req.body;
    console.log("Registering user:", email, phone, userType);

    const pool = getPool();

    // Validate user type
    const validUserTypes = ["patient", "practitioner", "admin", "staff"];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    // Check if user already exists
    const [existingUser] = await pool.execute(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [email, phone]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const [newUser] = await pool.execute(
      "INSERT INTO users (user_id, email, phone, password_hash, user_type, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, email, phone, hashedPassword, userType, firstName, lastName]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userId: userId,
        email: email,
        userType: userType,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const pool = getPool();

    // Find user
    const [user] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (user.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user[0].user_id,
        email: user[0].email,
        role: user[0].user_type,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );
    console.log("Token generated for user:", token);
    res.json({
      message: "Login successful",
      token,
      user: {
        userId: user[0].user_id,
        email: user[0].email,
        firstName: user[0].first_name,
        lastName: user[0].last_name,
        userType: user[0].user_type,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
