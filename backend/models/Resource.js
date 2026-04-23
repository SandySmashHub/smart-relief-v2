// models/Resource.js
const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  location: { type: String, required: true, trim: true },
  type:     { type: String, enum: ['food', 'water', 'medicine'], required: true },
  quantity: { type: Number, required: true, min: 0 },
  addedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
