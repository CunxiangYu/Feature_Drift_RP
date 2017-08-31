// Collection for mapping first 3 level categories
const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  top: String,
  subLevels: [{
    second : String,
    third: [{
      name: String,
      num: Number
    }]
  }]
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
