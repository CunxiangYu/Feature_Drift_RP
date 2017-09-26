// Collection for each model and its corresponding specs
const mongoose = require('mongoose');

const specificationSchema = mongoose.Schema({
  model: String,
  specification: String
});

const Specification = mongoose.model('Specification', specificationSchema);
module.exports = Specification;
