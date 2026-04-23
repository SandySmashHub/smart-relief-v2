// routes/statsRoutes.js
const express = require('express');
const router  = express.Router();
const { getStats } = require('../controllers/statsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getStats);

module.exports = router;
