const express = require("express");
const router = express.Router();

const checkRoutes = require("./checkRoutes");
const authRoutes = require("./authRoutes");

router.use("/check", checkRoutes);
router.use("/auth", authRoutes);

module.exports = router;
