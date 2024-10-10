const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UnitSchema = new Schema({
    subjectId: String,
    name: String,
    description: String,
    image: String,
    encryptedUnitId: String
})

module.exports = mongoose.model('Unit', UnitSchema);