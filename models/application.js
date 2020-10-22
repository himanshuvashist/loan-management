const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

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
    tenure:Number,
    date: {
        type: Date,
        default: Date.now,
    },
})

const application_model = mongoose.model('application', application_schema)

module.exports = application_model
