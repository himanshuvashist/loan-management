const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.ObjectId

const application_schema = new mongoose.Schema({
    on_behalf:{
        type:ObjectId,
        ref:'user_model'
    },
    submitted_by: {
        type: ObjectId,
        ref: 'user_model',
    },
    approved_by: {
        type: ObjectId,
        ref: 'user_model',
    },
    stage: Number,
    date: {
        type: Date,
        Default: Date.now,
    },
})

const application_model = mongoose.model('application', application_schema)

module.exports = application_model
