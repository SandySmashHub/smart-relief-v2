// controllers/requestController.js
const Request  = require('../models/Request');
const Resource = require('../models/Resource');
const { validationResult } = require('express-validator');

// POST /api/requests  — user submits help request
exports.createRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  const { location, type, quantity, lat, lng } = req.body;
  try {
    const request = await Request.create({
      user: req.user._id,
      userName: req.user.name,
      location, type,
      quantity: Number(quantity),
      lat: lat || null,
      lng: lng || null,
    });
    res.status(201).json({ message: 'Request submitted', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/requests  — user sees own; admin sees all
exports.getRequests = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const { type, status, search } = req.query;

    if (type)   filter.type   = type;
    if (status) filter.status = status;
    if (search) filter.location = { $regex: search, $options: 'i' };

    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/requests/assign  — admin assigns resource to request
exports.assignResource = async (req, res) => {
  const { requestId, resourceId } = req.body;
  if (!requestId || !resourceId)
    return res.status(400).json({ message: 'requestId and resourceId required' });

  try {
    const helpReq  = await Request.findById(requestId);
    const resource = await Resource.findById(resourceId);

    if (!helpReq)  return res.status(404).json({ message: 'Request not found' });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (helpReq.status === 'Assigned')
      return res.status(400).json({ message: 'Request already assigned' });
    if (helpReq.type !== resource.type)
      return res.status(400).json({ message: 'Type mismatch between request and resource' });
    if (resource.quantity < helpReq.quantity)
      return res.status(400).json({
        message: `Insufficient quantity. Available: ${resource.quantity}, Needed: ${helpReq.quantity}`,
      });

    // ── Smart Matching Logic ──────────────────────────────────────────────────
    resource.quantity -= helpReq.quantity;
    await resource.save();

    helpReq.status = 'Assigned';
    await helpReq.save();
    // ─────────────────────────────────────────────────────────────────────────

    res.json({ message: 'Resource assigned successfully', request: helpReq, resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/requests/auto-match  — admin triggers auto-matching for all pending
exports.autoMatch = async (req, res) => {
  try {
    const pending   = await Request.find({ status: 'Pending' });
    const resources = await Resource.find({ quantity: { $gt: 0 } });
    let matched = 0;

    for (const req of pending) {
      const resource = resources.find(
        r => r.type === req.type && r.quantity >= req.quantity
      );
      if (resource) {
        resource.quantity -= req.quantity;
        await resource.save();
        req.status = 'Assigned';
        await req.save();
        matched++;
      }
    }

    res.json({ message: `Auto-matched ${matched} request(s)`, matched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
