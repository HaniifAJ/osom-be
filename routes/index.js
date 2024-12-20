const express = require("express");
const router = express.Router();

const checkRoutes = require("./checkRoutes");
const authRoutes = require("./authRoutes");
const matchRoutes = require('./matchRoutes');
const userRoutes = require('./userRoutes');

router.use("/check", checkRoutes);
router.use("/auth", authRoutes);
router.use('/match', matchRoutes)
router.use('/users', userRoutes)

module.exports = router;
