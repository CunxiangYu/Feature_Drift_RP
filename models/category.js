// Collection for mapping first 3 level categories
const mongoose = require('mongoose');

const categoryScheme = mongoose.Scheme({
  top: String,
  subLevels: [{
    second : String,
    third: [{
      type: String
    }]
  }]
});

const Category = mongoose.model('Category', categoryScheme);
module.exports = Category;
