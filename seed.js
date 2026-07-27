const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const seed = async () => {
  await Product.deleteMany();
  const products = [
    { name: 'Product-1 Auto Parts', price: 6000, termDays: 180, dailyIncome: 1300, totalIncome: 234000, level: 1 },
    { name: 'Product-2 Auto Parts', price: 12000, termDays: 180, dailyIncome: 2800, totalIncome: 504000, level: 2 },
    { name: 'Product-3 Auto Parts', price: 24000, termDays: 180, dailyIncome: 6000, totalIncome: 1080000, level: 3 },
    { name: 'Product-4 Auto Parts', price: 48000, termDays: 180, dailyIncome: 12500, totalIncome: 2250000, level: 4 },
    { name: 'Product-5 Auto Parts', price: 96000, termDays: 180, dailyIncome: 25000, totalIncome: 4500000, level: 5 },
    { name: 'Product-6 Auto Parts', price: 192000, termDays: 180, dailyIncome: 50000, totalIncome: 9000000, level: 6 }
  ];
  await Product.insertMany(products);
  console.log('✅ Products seeded!');
  process.exit();
};

seed();