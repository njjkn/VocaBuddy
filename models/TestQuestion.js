const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestQuestionSchema = new Schema({
    testId: String,
    testQuestionExplanationId: String,
    conceptIds: Array,
    title: String,
    number: Number,
    difficultyLevel: String,
    context: Array,
    images: Array,
    choices: Array,
    answer: Array,
    isMultipleChoice: Boolean,
    directions: String,
    directionImages: Array,
    section: String,
    skillId: String,
    isFRQQuestion: Boolean
})

module.exports = mongoose.model('TestQuestion', TestQuestionSchema);