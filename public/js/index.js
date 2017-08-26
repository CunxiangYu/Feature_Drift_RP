$(document).ready(function() {
  // Init materialize select menu
  $('select').material_select();

  // Ajax call asking server RP's category when select menu value change
  $('select').change(function() {
    let referenceProduct = $(this).val();
    let data = {
      referenceProduct: referenceProduct
    };

    $.ajax({
      type: 'POST',
      url: 'rpCategory',
      data: data,
      dataType: 'json',
      success: function(res) {
        let category = res.category;
        $('#indexCategory').text(category);
        $('#indexCategoryDiv').show();
      }
    });
  });
});
