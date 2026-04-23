// controllers/resourceController.js
const Resource = require('../models/Resource');
const { validationResult } = require('express-validator');

// POST /api/resources
exports.addResource = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { location, type, quantity } = req.body;
  try {
    const resource = await Resource.create({
      location, type,
      quantity: Number(quantity),
      addedBy: req.user._id,
    });
    res.status(201).json({ message: 'Resource added', resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/resources
exports.getResources = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/resources/:id  — admin can remove depleted resources
exports.deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
