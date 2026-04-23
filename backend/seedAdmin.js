// seedAdmin.js — run once: node seedAdmin.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ email: 'admin@relief.com' });
  if (exists) { console.log('✅ Admin already exists'); process.exit(0); }
  await User.create({ name: 'Relief Admin', email: 'admin@relief.com', password: 'admin123', role: 'admin' });
  console.log('✅ Admin created → admin@relief.com / admin123');
  process.exit(0);
})();
