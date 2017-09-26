// Collection for mapping level 3 categories to their product specifications
const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  third: String,
  models: [String]
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
