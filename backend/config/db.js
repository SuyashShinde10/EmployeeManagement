const mongoose = require('mongoose');
require('dotenv').config(); // 1. Load the .env file

// 2. Use process.env.MONGO_URI instead of the hardcoded string
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ DB Connected Successfully');
  })
  .catch((err) => {
    console.error('❌ DB Connection Error:', err);
  });