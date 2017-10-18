var fill = d3.scale.category20();

function draw(words) {
  d3.select('#wordCloud').append("svg")
      .attr("width", 600)
      .attr("height", 600)
    .append("g")
      .attr("transform", "translate(300,300)")
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

d3.layout.cloud().size([600, 600])
    .words(wordCloudData.map(function(d) {
      return {text: d, size: 10 + Math.random() * 90};
    }))
    // .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function(d) { return d.size * 0.7; })
    .on("end", draw)
    .start();
