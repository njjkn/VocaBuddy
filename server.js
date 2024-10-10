const express = require('express');
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser')
require('dotenv').config();
const connectWithRetry = require('./db'); 
const subjectController = require("./routes/api/subjectController");
const testController = require("./routes/api/testController");
const wordController = require("./routes/api/wordController");
const cors = require('cors');

const app = express();

// Define the allowed origins
const allowedOrigins = ['http://localhost:3000'];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin, like mobile apps or curl requests
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,  // Enable credentials. This is needed for cookies to work
}));

// Enable CORS for all routes
// TODO: local host 3000 will change to the frontend domain once its live
app.use(cors({
    origin: 'http://localhost:3000',  // replace with your application's URL
    credentials: true,  // IMPORTANT: enable credentials. This is needed for cookies to work
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan("dev"))
app.use(helmet())

const PORT = process.env.PORT || 4002;
connectWithRetry();

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use("/api/v1/vocabuddy/subject", subjectController);
app.use("/api/v1/vocabuddy/test", testController);
app.use("/api/v1/vocabuddy/word", wordController);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));