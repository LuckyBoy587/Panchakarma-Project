const express = require("express");
const { getPool } = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Get all therapies
router.get("/", authenticateToken, authorizeRoles('practitioner', 'staff', 'admin'), async (req, res) => {
  try {
    const pool = getPool();

    // Get all therapies
    const [therapies] = await pool.execute(`
      SELECT * FROM therapies ORDER BY name ASC
    `);

    // Get required items for all therapies
    const [allRequiredItems] = await pool.execute(`
      SELECT tri.therapy_id, tri.quantity, si.id, si.name, si.category, si.unit
      FROM therapy_required_items tri
      JOIN stock_items si ON tri.stock_id = si.id
      ORDER BY tri.therapy_id, si.category, si.name
    `);

    // Group required items by therapy_id
    const itemsByTherapy = {};
    allRequiredItems.forEach(item => {
      if (!itemsByTherapy[item.therapy_id]) {
        itemsByTherapy[item.therapy_id] = [];
      }
      itemsByTherapy[item.therapy_id].push({
        id: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity
      });
    });

    // Add required items to each therapy
    const therapiesWithItems = therapies.map(therapy => ({
      ...therapy,
      required_items: itemsByTherapy[therapy.id] || []
    }));

    res.json(therapiesWithItems);
  } catch (error) {
    console.error("Get therapies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get therapy by ID with required items
router.get("/:id", authenticateToken, authorizeRoles('practitioner', 'staff', 'admin'), async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    // Get therapy details
    const [therapies] = await pool.execute(`
      SELECT * FROM therapies WHERE id = ?
    `, [id]);

    if (therapies.length === 0) {
      return res.status(404).json({ error: "Therapy not found" });
    }

    const therapy = therapies[0];

    // Get required items for this therapy
    const [requiredItems] = await pool.execute(`
      SELECT tri.quantity, si.name, si.category, si.unit
      FROM therapy_required_items tri
      JOIN stock_items si ON tri.stock_id = si.id
      WHERE tri.therapy_id = ?
      ORDER BY si.category, si.name
    `, [id]);

    therapy.required_items = requiredItems;

    res.json(therapy);
  } catch (error) {
    console.error("Get therapy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new therapy
router.post("/", authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = getPool();
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Therapy name is required" });
    }

    // Get the next ID
    const [maxId] = await pool.execute("SELECT MAX(id) as maxId FROM therapies");
    const nextId = (maxId[0].maxId || 0) + 1;

    await pool.execute(`
      INSERT INTO therapies (id, name) VALUES (?, ?)
    `, [nextId, name]);

    res.status(201).json({
      id: nextId,
      name,
      message: "Therapy created successfully"
    });
  } catch (error) {
    console.error("Create therapy error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: "Therapy with this name already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Update therapy
router.put("/:id", authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Therapy name is required" });
    }

    const [result] = await pool.execute(`
      UPDATE therapies SET name = ? WHERE id = ?
    `, [name, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Therapy not found" });
    }

    res.json({
      id: parseInt(id),
      name,
      message: "Therapy updated successfully"
    });
  } catch (error) {
    console.error("Update therapy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete therapy
router.delete("/:id", authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;

    const [result] = await pool.execute(`
      DELETE FROM therapies WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Therapy not found" });
    }

    res.json({ message: "Therapy deleted successfully" });
  } catch (error) {
    console.error("Delete therapy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
