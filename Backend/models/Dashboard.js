// models/Dashboard.js - Only if you want to cache dashboard data
const mongoose = require('mongoose');

const dashboardCacheSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  stats: { type: Object },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DashboardCache', dashboardCacheSchema);

