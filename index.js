
var padding = 1;
var svg = d3.select('svg');
var margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 50
};
var width = +svg
  .attr('width') - margin.left - margin.right;
var height = +svg
  .attr('height') - margin.top - margin.bottom;
var g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var scaleX = d3.scaleBand()
  .rangeRound([0, width]);

var scaleY = d3.scaleLinear()
  .rangeRound([height, 0]);

d3.json('stock.json', function(error, data) {
  if (error) throw error;

  var filteredData = data['tradeList']
    .slice(0, 20)
    .map(function(trade) {
      return trade['shares'];
    });

  var indices = filteredData.map(function(bar, index) {
    return index;
  })

  scaleX.domain(indices);
  scaleY.domain([0, d3.max(filteredData, function(datum) {
    return datum;
  })]);

  var xAxis = d3.axisBottom(scaleX);
  var yAxis = d3.axisLeft(scaleY);

  g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0, ' + height + ')')
    .call(xAxis);

  g.append('g')
    .attr('class', 'axis axis--y')
    .call(yAxis);

  var rects = g.selectAll('rect')
    .data(filteredData)
    .enter().append('rect');

  rects
    .attr('x', function(barData) {
      var indices = barData.map
      return scaleX(indices);
    })
    .attr('y', function(barData) {
      return scaleY(barData);
    })
    .attr('width', function(barData) {
      return scaleX(indices);
    })
    .attr('height', function(barData) {
      return height - scaleY(barData);
    });
});
