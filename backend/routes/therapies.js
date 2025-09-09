const express = require("express");
const { getPool } = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all therapies
router.get("/", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [therapies] = await pool.execute(
      "SELECT * FROM therapies ORDER BY name ASC"
    );
    res.json(therapies);
  } catch (error) {
    console.error("Get therapies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get therapy by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [therapy] = await pool.execute(
      "SELECT * FROM therapies WHERE id = ?",
      [req.params.id]
    );

    if (therapy.length === 0) {
      return res.status(404).json({ error: "Therapy not found" });
    }

    res.json(therapy[0]);
  } catch (error) {
    console.error("Get therapy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get required items for a therapy
router.get("/:id/required-items", authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [requiredItems] = await pool.execute(`
      SELECT 
        tri.quantity,
        si.name as item_name,
        si.category,
        si.unit
      FROM therapy_required_items tri
      JOIN stock_items si ON tri.stock_id = si.id
      WHERE tri.therapy_id = ?
      ORDER BY si.category, si.name
    `, [req.params.id]);

    res.json(requiredItems);
  } catch (error) {
    console.error("Get therapy required items error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
