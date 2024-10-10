const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    age: Number,
    email: String,
    school: String,
    userType: String,
    enrolledSubjects: Array,
    completedTestResults: Array,
    encryptedObjectId: String
})

module.exports = mongoose.model('User', UserSchema);