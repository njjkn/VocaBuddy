const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SectionTimeSchema = new Schema({
    sectionId: String,
    timeInTotalSeconds: Number,
})

module.exports = mongoose.model('SectionTime', SectionTimeSchema);