var fill = d3.scale.category20();

function draw(words) {
  d3.select('#wordCloud').append("svg")
      .attr("width", 500)
      .attr("height", 500)
    .append("g")
      .attr("transform", "translate(250,250)")
    .selectAll("text")
      .data(words)
    .enter().append("text")
      .style("font-size", function(d) { return d.size + "px"; })
      .style("font-family", "Impact")
      .style("fill", function(d, i) { return fill(i); })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) { return d.text; });
}

wordCloudData.map((model) => {
  let modelName = model.modelName;
  let wordsArray = model.specArray;
  var $title = $('<h4></h4>').text(modelName);
  $('#wordCloud').append($title);
  let modal = "<div id='modal - " + model.modelName + "' class='modal'>";
  modal += "<div class='modal-content'>";
  modal += "<h4>Select non-feature words for: <span class='teal-text text-lighten-2'>" + model.modelName + "</span></h4>";
  modal += "<div class='row'><form class='col s12' id='" + model.modelName + "'>";
  modal += "<div class='row'>";
  for (let i = 0; i < wordsArray.length; i++) {
    modal += "<p class='col s2'><input type='checkbox' name='nonFeatureWords' id='" + wordsArray[i] + i + "' value='" + wordsArray[i] + "' />";
    modal += "<label for='" +wordsArray[i] + i + "'>" + wordsArray[i] + "</label></p>";
  }
  modal += "</div></form></div></div>";
  modal += "<div class='modal-footer'>";
  modal += "<button type='submit' form='" + model.modelName + "' ";
  modal += "class='modal-action modal-close waves-effect waves-green btn-flat'>";
  modal += "Submit</button></div></div>";
  $modal = $('<div></div>').html(modal);
  $('body').append($modal);

  d3.layout.cloud().size([500, 500])
      .words(wordsArray.map(function(d) {
        return {text: d, size: 30 + Math.random() * 50};
      }))
      // .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font("Impact")
      .fontSize(function(d) { return d.size * 0.6; })
      .on("end", draw)
      .start();
});


$(document).ready(function() {
  let wordCloudCount = $('#wordCloud svg').length;
  let svgArray = $('#wordCloud svg').clone();
  let titleArray = $('#wordCloud h4').clone();
  for (let i = 0; i < wordCloudCount; i++) {
    let $wordCloudDiv = $('<div></div>').addClass('center-align wordCloud').attr('id', 'wordCloud' + i);
    let $title = titleArray[i];
    let $svg = svgArray[i];
    let $buttonDiv = $('<div></div>').addClass('center-align');
    let $button = $('<button></button').addClass("waves-effect waves-light btn modal-trigger red lighten-1").text('Remove non-feature words');

    $buttonDiv.append($button);
    $wordCloudDiv.append($title);
    $wordCloudDiv.append($svg);
    $wordCloudDiv.append($buttonDiv);
    $('#wordCloudFinal').append($wordCloudDiv);
    $button.attr('data-target', 'modal - ' + $('#wordCloud' + i + ' h4').text());
  }
  $('#wordCloud').hide();
  $('.modal').modal();

  $( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    let removedWordsArray = JSON.stringify($( this ).serializeArray());
    let targetModel = $(this).attr('id');
    let data = {
      removedWordsArray: removedWordsArray,
      targetModel: targetModel
    };

    $.ajax({
      type: 'POST',
      url: 'removeWords',
      data: data,
      dataType: 'json'
    });
  });



















});
