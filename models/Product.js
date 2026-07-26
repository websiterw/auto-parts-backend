const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },            // e.g., "VIP1 Anywheel Bike"
  price: { type: Number, required: true },           // e.g., 6000
  termDays: { type: Number, required: true },        // e.g., 150
  dailyIncome: { type: Number, required: true },     // e.g., 1200
  totalIncome: { type: Number, required: true },     // e.g., 180000
  level: { type: Number, default: 1 },               // VIP level (1,2,3...)
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);