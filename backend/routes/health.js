const express = require("express");

const router = express.Router();

// Health check route
router.get("/", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

module.exports = router;
