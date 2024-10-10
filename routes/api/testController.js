const express = require('express')
const router = express.Router();

const User = require("../../models/User")
const Subject = require("../../models/Subject")
const Test = require("../../models/Test")
const TestResults = require("../../models/TestResults")
const {decryptData, encryptData} = require('../../utils/authUtils')
const handleError = require('../../utils/errorHandler')
const { constructTestPayloadOptimized } = require("../../utils/lambdaUtils")


router.get("/digital/sat/test/questions/:testID", async (req, res) => {
    try {
        const encryptedTestId = decodeURIComponent(req.params.testID);
        const decryptedTestid = decryptData(encryptedTestId);

        const testQuestionsPayload = await constructTestPayloadOptimized(decryptedTestid)

        // Return the cached data or constructed payload
        return res.status(200).json(encryptData(JSON.stringify(testQuestionsPayload)));
    } catch (error) {
        console.log(error);
        handleError(error, res);
    }
});


router.post('/scores', async (req, res) => {
    try {
        const userEmail = req.body.email;
        const user = await User.findOne({ email: userEmail });
        const userId = decryptData(user.encryptedObjectId);

        const subjectName = req.body.subjectName;
        // Cache key for the subject
        const subject = await Subject.findOne({ name: subjectName });
        
        const subjectId = subject._id.toString();

        const tests = await Test.find({ subjectId, isProduction: true }).sort({ testPriority: 1 });

        // Cache key for test results
        const testResults = await TestResults.find({ userId, subjectId })

        const results = tests.map(test => {
            const testId = test._id.toString();
            const relevantResults = testResults.filter(result => result.testId === testId);
        
            const attempts = relevantResults.map(result => ({
                overallScore: result.totalScore,
                readingWritingScore: result.sectionScores[0],
                mathScore: result.sectionScores[1],
                timeStamp: result.timestamp,
            }));
        
            // Sort the attempts by timestamp in ascending order
            attempts.sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));
        
            return {
                encryptedTestId: test.encryptedTestId,
                testTitle: test.name,
                hasTakenTest: relevantResults.length > 0,
                allowList: test.allowList,
                attempts
            };
        });
        
        // Sort the results by the test number extracted from the testTitle
        results.sort((a, b) => {
            const testNumberA = parseInt(a.testTitle.match(/\d+$/)[0], 10);
            const testNumberB = parseInt(b.testTitle.match(/\d+$/)[0], 10);
            return testNumberA - testNumberB;
        });
        
        // Set the output as results
        const output = results;
        
        // Return the encrypted output in the response
        return res.status(200).json(encryptData(JSON.stringify(output)));
        
    } catch (error) {
        console.error("API Error:", error);
        handleError(error, res);
    }
});

module.exports = router;