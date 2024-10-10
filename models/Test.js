const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestSchema = new Schema({
    subjectId: String,
    name: String,
    description: String,
    questions: Array,
    testType: String,
    sectionIds: Array,
    testPriority: Number,
    isProduction: Boolean,
    encryptedTestId: String,
    allowList: Array
})

module.exports = mongoose.model('Test', TestSchema);