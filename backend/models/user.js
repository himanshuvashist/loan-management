const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const user_schema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'There is no username'],
  },
  email: {
    type: String,
    required: [true, 'There is no email'],
  },
  password: {
    type: String,
    required: [true, 'There is not password'],
  },
  userType: {
    type: String,
    required: [true, 'There is no userType'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  registeredUnder: {
    type: ObjectId,
    ref: 'application_model',
  },
});

const user_model = mongoose.model('user', user_schema);

module.exports = user_model;
