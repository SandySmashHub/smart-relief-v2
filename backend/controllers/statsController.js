// controllers/statsController.js
const Request  = require('../models/Request');
const Resource = require('../models/Resource');
const User     = require('../models/User');

// GET /api/stats  — admin dashboard summary
exports.getStats = async (req, res) => {
  try {
    const [total, pending, assigned, totalResources, users] = await Promise.all([
      Request.countDocuments(),
      Request.countDocuments({ status: 'Pending' }),
      Request.countDocuments({ status: 'Assigned' }),
      Resource.aggregate([{ $group: { _id: null, total: { $sum: '$quantity' } } }]),
      User.countDocuments({ role: 'user' }),
    ]);

    res.json({
      total,
      pending,
      assigned,
      totalResourceUnits: totalResources[0]?.total || 0,
      totalUsers: users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
