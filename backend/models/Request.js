// models/Request.js
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName:  { type: String, required: true },
  location:  { type: String, required: true, trim: true },
  type:      { type: String, enum: ['food', 'water', 'medicine'], required: true },
  quantity:  { type: Number, required: true, min: 1 },
  status:    { type: String, enum: ['Pending', 'Assigned'], default: 'Pending' },
  // Lat/lng for map markers — optional, filled by frontend geolocation or geocoding
  lat:       { type: Number, default: null },
  lng:       { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
