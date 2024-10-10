const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubjectSchema = new Schema({
    name: String,
    image: String,
    zoomLink: String,
    time: String,
    units: Array,
    tests: Array,
    subjectPriority: Number,
    isProduction: Boolean,
    encryptedObjectId: String
})

module.exports = mongoose.model('Subject', SubjectSchema);