const mongoose = require('mongoose');

const Todo = mongoose.model('Todo', {
  text: {
    type: String,
    require: true,
    minlength: 1,
    trim: true
  },
  complete: {
    type: Boolean,
    default: false
  },
  completeAt: {
    type: Number,
    default: null
  }
});

module.exports = {
  Todo
};