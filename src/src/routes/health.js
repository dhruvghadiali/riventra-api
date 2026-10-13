const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/live", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.get("/ready", (req, res) => {
  const isReady = mongoose.connection.readyState === 1;

  res.status(isReady ? 200 : 503).json({
    status: isReady ? "ready" : "not_ready",
    database: isReady ? "connected" : "disconnected",
  });
});

module.exports = router;
