const mongoose = require('mongoose');
const Task = require('./models/Task');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const seedTasks = async () => {
  await Task.deleteMany();
  const tasks = [
    { name: 'Invite 3 Level 1 investors', level: 1, target: 3, reward: 2000 },
    { name: 'Invite 10 Level 1 investors', level: 2, target: 10, reward: 5000 },
    { name: 'Invite 30 Level 1 investors', level: 3, target: 30, reward: 10000 }
  ];
  await Task.insertMany(tasks);
  console.log('✅ Tasks seeded!');
  process.exit();
};

seedTasks();
