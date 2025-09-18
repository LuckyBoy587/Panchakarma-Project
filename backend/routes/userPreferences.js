const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

// POST /api/user-preferences - create or update user preference
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { notify_before } = req.body;
    if (notify_before === undefined || notify_before === null)
      return res.status(400).json({ error: "notify_before is required" });

    // Get user id from authenticated token
    const user_id = req.user && (req.user.userId || req.user.user_id);
    if (!user_id)
      return res.status(401).json({ error: "Invalid authentication token" });

    const pool = db.getPool();
    const conn = await pool.getConnection();
    try {
      // Check if user exists
      const [users] = await conn.query(
        "SELECT user_id FROM users WHERE user_id = ?",
        [user_id]
      );
      if (users.length === 0)
        return res.status(404).json({ error: "User not found" });

      // Upsert preference: attempt update, else insert
      const [updated] = await conn.query(
        "UPDATE user_preferences SET notify_before = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
        [notify_before, user_id]
      );

      if (updated.affectedRows === 0) {
        // Insert new row
        await conn.query(
          "INSERT INTO user_preferences (user_id, notify_before) VALUES (?, ?)",
          [user_id, notify_before]
        );
      }

      res.status(200).json({ message: "Preference saved" });
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/user-preferences - get current user's preference
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const user_id = req.user && (req.user.userId || req.user.user_id);
    if (!user_id)
      return res.status(401).json({ error: "Invalid authentication token" });

    const pool = db.getPool();
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        "SELECT user_id, notify_before, created_at, updated_at FROM user_preferences WHERE user_id = ?",
        [user_id]
      );
      if (rows.length === 0)
        return res.status(404).json({ preferences: { notify_before: 30 } });
      res.status(200).json({ preferences: rows[0] });
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
