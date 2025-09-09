const express = require("express");
const multer = require("multer");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// File upload route
router.post("/", authenticateToken, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({
    message: "File uploaded successfully",
    filePath: req.file.path,
    filename: req.file.filename,
  });
});

module.exports = router;
