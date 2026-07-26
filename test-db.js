require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;
console.log('Connecting to:', uri);

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });