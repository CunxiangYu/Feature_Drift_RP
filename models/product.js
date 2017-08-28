// Collection for mapping level 3 categories to their product specifications
const mongoose = require('mongoose');

const productScheme = mongoose.Scheme({
  third: String,
  product: [{
    model: String,
    specification: String
  }]
});

const Product = mongoose.model('Product', productScheme);
module.exports = Product;
