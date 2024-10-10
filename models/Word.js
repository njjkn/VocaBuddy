const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordSchema = new Schema({
    word: String,
    shortDef: Array,
    syns: Array,
    ants: Array,
    form: String,
    userIds: Array,
    sampleSentence: Array
})

module.exports = mongoose.model('Word', WordSchema);