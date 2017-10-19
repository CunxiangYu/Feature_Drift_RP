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

  d3.layout.cloud().size([500, 500])
      .words(wordsArray.map(function(d) {
        return {text: d, size: 10 + Math.random() * 90};
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
    let $wordCloudDiv = $('<div></div>').attr('class', 'wordCloud');
    let $title = titleArray[i];
    let $svg = svgArray[i];
    $wordCloudDiv.append($title);
    $wordCloudDiv.append($svg);
    $('#wordCloudFinal').append($wordCloudDiv);
  }
  $('#wordCloud').hide();
});
