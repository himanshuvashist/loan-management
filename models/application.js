const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const application_schema = new mongoose.Schema({
  application_id: {
    type: ObjectId,
  },
  on_behalf: {
    type: ObjectId,
    ref: 'user_model',
  },
  submitted_by: {
    type: ObjectId,
    ref: 'user_model',
  },
  approved_by: {
    type: ObjectId,
    ref: 'user_model',
  },
  status: {type: String, default: "new"},
  tenure: Number,
  amount: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

const application_model = mongoose.model('application', application_schema);

module.exports = application_model;
