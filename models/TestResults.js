const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestResultsSchema = new Schema({
    reportName: String,
    userId: String,
    testId: String,
    timestamp: String,
    isFirstAttempt: Boolean,
    subjectId: String,
    totalScore: Number,
    rawScores: Array,
    organizationTestPercentile: Number,
    nationalTestPercentile: Number,
    minTestScore: Number,
    maxTestScore: Number,
    totalTestQuestions: Number,
    totalIncorrectQuestions: Number,
    totalCorrectQuestions: Number,
    totalOmittedQuestions: Number,
    sectionScores: Array,
    userAnswers: Array,
    correctAnswers: Array,
    sectionNames: Array,
    encryptedTestResultsId: String,
    chosenArray: Array,
})

module.exports = mongoose.model('TestResults', TestResultsSchema);