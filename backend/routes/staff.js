const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getPool } = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Get all stock items
router.get("/stock", authenticateToken, authorizeRoles("staff", "admin"), async (req, res) => {
  try {
    const pool = getPool();

    const [stock] = await pool.execute(`
      SELECT s.*, u.first_name, u.last_name
      FROM stock s
      JOIN users u ON s.updated_by = u.user_id
      ORDER BY s.last_updated DESC
    `);
    res.json(stock);
  } catch (error) {
    console.error("Get stock error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add new stock item
router.post("/stock", authenticateToken, authorizeRoles("staff", "admin"), async (req, res) => {
  try {
    const pool = getPool();

    const { itemName, quantity, unit } = req.body;
    const stockId = uuidv4();

    await pool.execute(
      "INSERT INTO stock (id, item_name, quantity, unit, updated_by) VALUES (?, ?, ?, ?, ?)",
      [stockId, itemName, quantity, unit, req.user.userId]
    );

    const [newStock] = await pool.execute(
      `
      SELECT s.*, u.first_name, u.last_name
      FROM stock s
      JOIN users u ON s.updated_by = u.user_id
      WHERE s.id = ?
    `,
      [stockId]
    );

    res.status(201).json({
      message: "Stock item added successfully",
      stock: newStock[0],
    });
  } catch (error) {
    console.error("Add stock error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update stock item
router.put("/stock/:id", authenticateToken, authorizeRoles("staff", "admin"), async (req, res) => {
  try {
    const pool = getPool();

    const { id } = req.params;
    const { itemName, quantity, unit } = req.body;

    await pool.execute(
      "UPDATE stock SET item_name = ?, quantity = ?, unit = ?, updated_by = ? WHERE id = ?",
      [itemName, quantity, unit, req.user.userId, id]
    );

    const [updatedStock] = await pool.execute(
      `
      SELECT s.*, u.first_name, u.last_name
      FROM stock s
      JOIN users u ON s.updated_by = u.user_id
      WHERE s.id = ?
    `,
      [id]
    );

    if (updatedStock.length === 0) {
      return res.status(404).json({ error: "Stock item not found" });
    }

    res.json({
      message: "Stock item updated successfully",
      stock: updatedStock[0],
    });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete stock item
router.delete("/stock/:id", authenticateToken, authorizeRoles("staff", "admin"), async (req, res) => {
  try {
    const pool = getPool();

    const { id } = req.params;

    // Check if stock item exists
    const [existingStock] = await pool.execute(
      "SELECT * FROM stock WHERE id = ?",
      [id]
    );
    if (existingStock.length === 0) {
      return res.status(404).json({ error: "Stock item not found" });
    }

    // Delete the stock item
    await pool.execute("DELETE FROM stock WHERE id = ?", [id]);

    res.json({
      message: "Stock item deleted successfully",
    });
  } catch (error) {
    console.error("Delete stock error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all available stock items (master list)
router.get("/stock-items", authenticateToken, authorizeRoles("staff", "admin"), async (req, res) => {
  try {
    const pool = getPool();

    const [stockItems] = await pool.execute(`
      SELECT * FROM stock_items
      ORDER BY category, name
    `);
    res.json(stockItems);
  } catch (error) {
    console.error("Get stock items error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all rooms
router.get("/rooms", authenticateToken, authorizeRoles("staff", "admin"), async (req, res) => {
  try {
    const pool = getPool();

    const [rooms] = await pool.execute(`
      SELECT r.*, u.first_name, u.last_name
      FROM rooms r
      JOIN users u ON r.last_updated_by = u.user_id
      ORDER BY r.room_name
    `);
    res.json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update room status
router.put("/rooms/:id", authenticateToken, authorizeRoles("staff", "admin"), async (req, res) => {
  try {
    const pool = getPool();

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["available", "occupied", "maintenance"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await pool.execute(
      "UPDATE rooms SET status = ?, last_updated_by = ? WHERE id = ?",
      [status, req.user.userId, id]
    );

    const [updatedRoom] = await pool.execute(
      `
      SELECT r.*, u.first_name, u.last_name
      FROM rooms r
      JOIN users u ON r.last_updated_by = u.user_id
      WHERE r.id = ?
    `,
      [id]
    );

    if (updatedRoom.length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      message: "Room status updated successfully",
      room: updatedRoom[0],
    });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
