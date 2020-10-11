const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.ObjectId

const user_schema = new mongoose.Schema({
    id: ObjectId,
    userName: String,
    email: String,
    password: String,
    date: Date,
})

const user_model = mongoose.model('user', user_schema)

module.exports = user_model
