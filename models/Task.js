const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },            // e.g., "Invite 3 Level 1 investors"
  level: { type: Number, required: true },           // LV1, LV2, LV3
  target: { type: Number, required: true },          // e.g., 3, 10, 30
  reward: { type: Number, required: true },          // e.g., 2000, 5000, 10000
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Task', TaskSchema);