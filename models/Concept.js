const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConceptSchema = new Schema({
    unitCategoryId: String,
    name: String,
    description: String,
    video: String,
    questions: Array,
    conceptPriority: Number,
    encryptedConceptId: String,
    isProduction: Boolean,
    skillId: String
})

module.exports = mongoose.model('Concept', ConceptSchema);