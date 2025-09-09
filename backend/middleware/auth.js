const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    }
  );
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
