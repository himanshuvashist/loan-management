const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.ObjectId

const application_schema = new mongoose.Schema({
    id: ObjectId,
    user_id: ObjectId,
    approved_by: ObjectId,
    stage: Number,
    date: Date,
})

const application_model = mongoose.model('application', application_schema)

module.exports = application_model
