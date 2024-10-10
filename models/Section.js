const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SectionSchema = new Schema({
    testId: String,
    sectionTitle: String,
    sectionDirections: Array,
    sectionDirectionImages: Array,
    sectionOrder: Number,
    difficultyLevel: String,
    isBreakRoom: Boolean,
    moduleCount: Number,
})

module.exports = mongoose.model('Section', SectionSchema);