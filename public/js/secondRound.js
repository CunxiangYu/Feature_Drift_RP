$(document).ready(function() {
  $('select').material_select();
  $("select").on('change', function() {
    let numOfRequiredOpt = parseInt($(this).attr('id'), 10);

    if ($(this).val().length > numOfRequiredOpt) {
      alert(`You can select up to ${numOfRequiredOpt} option(s) only`);
      $(this).val([]);
      $('select').material_select();
    }
  });
});
