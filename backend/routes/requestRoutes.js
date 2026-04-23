// routes/requestRoutes.js
const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const {
  createRequest, getRequests, assignResource, autoMatch,
} = require('../controllers/requestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const requestRules = [
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('type').isIn(['food', 'water', 'medicine']).withMessage('Type must be food, water, or medicine'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

router.post('/',           protect,              requestRules, createRequest);
router.get('/',            protect,              getRequests);
router.post('/assign',     protect, adminOnly,   assignResource);
router.post('/auto-match', protect, adminOnly,   autoMatch);

module.exports = router;
