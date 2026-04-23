// routes/resourceRoutes.js
const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const { addResource, getResources, deleteResource } = require('../controllers/resourceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const resourceRules = [
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('type').isIn(['food', 'water', 'medicine']).withMessage('Invalid type'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

router.post('/',        protect, adminOnly, resourceRules, addResource);
router.get('/',         protect, adminOnly, getResources);
router.delete('/:id',   protect, adminOnly, deleteResource);

module.exports = router;
