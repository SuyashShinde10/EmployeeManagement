const mongoose = require('mongoose');

// Connect to local MongoDB or Atlas
mongoose.connect('mongodb://localhost:27017/teamsync')
  .then(() => {
    console.log('DB Connected Successfully');
  })
  .catch((err) => {
    console.log(err);
  });