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
    let products = JSON.stringify(productArr);
    let data = {
      products: products
    };

    $.ajax({
      type: 'POST',
      url: 'selectModel',
      data: data,
      dataType: 'json',
      success: function(res) {
        $('#categoryTree').hide();

        var formHTML = '';
        res.data.forEach(function(product) {
          formHTML += '<div class="form-group">';
          formHTML += '<label>' + product.productName + '</label>';
          formHTML += '<select class="form-control custom-select" ';
          formHTML += 'name="selectedModels">';

          product.models.forEach(function(model) {
            formHTML += '<option value="' + model +'">' + model + '</option>';
          });

          formHTML += '</select></div>';
        });

        formHTML += '<button class="btn waves-effect waves-light" type="submit">';
        formHTML += 'Word Cloud <i class="material-icons right">send</i></button>';

        $('#modelForm').html(formHTML);
        $('div#model').show();
      }
    });
  });
});
