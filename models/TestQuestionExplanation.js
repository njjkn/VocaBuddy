const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestQuestionExplanationSchema = new Schema({
    testId: String,
    testQuestionId: String,
    correctAnswerExplanation: String,
    choiceOneExplanation: String,
    choiceTwoExplanation: String,
    choiceThreeExplanation: String,
    choiceFourExplanation: String,
    choiceFiveExplanation: String,
    choiceImages: Array
})

module.exports = mongoose.model('TestQuestionExplanation', TestQuestionExplanationSchema);