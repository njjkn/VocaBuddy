const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UnitCategorySchema = new Schema({
    unitId: String,
    name: String,
    description: String,
    categoryTags: Array,
    encryptedUnitCategoryId: String
})

module.exports = mongoose.model('UnitCategory', UnitCategorySchema);