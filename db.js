const mongoose = require('mongoose');

const MAX_RETRIES = 8; // Maximum number of retries
let attempts = 0;

const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    if (attempts < MAX_RETRIES) {
      attempts++;
      // Adjust the exponential backoff formula as needed to fit the timeframe
      // Here, using a smaller multiplier to stretch out retries over ~1 hour
      const delay = Math.min(5000 * (2 ** attempts), 3600000); // Cap the delay at 1 hour
      console.log(`Retrying to connect in ${delay}ms (Attempt ${attempts} of ${MAX_RETRIES})`);
      setTimeout(connectWithRetry, delay);
    } else {
      console.error('Exceeded maximum retry attempts. Please check the MongoDB connection settings and status.');
      // Exit the process after the final failed attempt
      process.exit(1);
    }
  }
};

module.exports = connectWithRetry;
