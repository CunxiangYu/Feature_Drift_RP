$(document).ready(function() {
  // Array holding all checked product
  var productArr = [];

  // Render the category tree with data 'treeData' (in selectProduct.pug file)
  $('#tree').treeview({
    data: treeData,
    levels: 3,
    showTags: true,
    showCheckbox: true,
    checkedIcon: 'glyphicon glyphicon-check',
    uncheckedIcon: 'glyphicon glyphicon-unchecked'
  });

  // If checked, push node name into array
  $('#tree').on('nodeChecked', function(e, node) {
    if (!productArr.includes(node.text)) {
      productArr.push(node.text);
    }
  });

  // If unchecked, remove from array
  $('#tree').on('nodeUnchecked', function(e, node) {
    productArr = productArr.filter(function(product) {
      return product != node.text;
    });
  });

  $('.btn').on('click', function(e) {
    // TO DO
  });
});
