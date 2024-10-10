const mongoose = require('mongoose');

const handleError = (error, res) => {
    if (!error) {
        console.error("API Error: Error object is undefined");
        return res.status(500).json({ error: "An unknown error occurred" });
    }
    
    console.error("API Error: ", error);

    // MongoDB ObjectId Errors
    if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ error: "Invalid user ID format" });
    }

    // General MongoDB Errors
    if (error.name === 'MongoError') {
        return res.status(500).json({ error: "Database error" });
    }

    // If the error is not recognized, return a generic 500 error
    return res.status(500).json({ error: "An error occurred" });
};

module.exports = handleError;