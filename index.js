var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseAskTime = d3.timeParse('%H:%M:%S');
var parseTradeTime = d3.timeParse('%H:%M')

var scaleX = d3.scaleTime()
  .rangeRound([0, width]);

var scaleY = d3.scaleLinear()
  .rangeRound([height, 0]);

var askArea = d3.area()
  .x(function(d) {
    return scaleX(d['timeStr']);
  })
  .y1(0)
  .curve(d3.curveStepAfter);

var bidArea = d3.area()
  .x(function(d) {
    return scaleX(d['timeStr'])
  })
  .y1(function(d) {
    return scaleY(d['bid']);
  })
  .curve(d3.curveStepAfter);

d3.json("stock.json", function(error, data) {
  if (error) throw error;

  var bboList = data['bboList'].map(function(bbo) {
    bbo['timeStr'] = bbo['timeStr'].slice(0, 8);
    bbo['timeStr'] = parseAskTime(bbo['timeStr']);
    return bbo;
  });

  var tradeList = data['tradeList'].map(function(trade) {
    var minutes = (trade['time'] / 60000000000).toFixed();
    var hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    var timeString = hours.toString() + ':' + minutes.toString();
    trade['time'] = parseTradeTime(timeString);
    return trade;
  });

  scaleX.domain(d3.extent(bboList, function(d) { return d['timeStr']; }));
  scaleY.domain([227500, 240000]);

  askArea.y0(function(d) {
    return scaleY(d['ask']);
  });
  bidArea.y0(height);

  var xAxis = d3.axisBottom(scaleX);

  var yAxis = d3
    .axisLeft(scaleY)
    .tickFormat(function(number) {
      return (number / 10000).toFixed(1);
    })

  g.append("path")
    .datum(bboList)
    .attr("fill", "#945E1E")
    .attr("d", askArea);

  g.append('path')
    .datum(bboList)
    .attr('fill', '#4C7249')
    .attr('d', bidArea);

  g.selectAll('circle')
    .data(tradeList)
    .enter().append('circle')
    .attr('cx', function(trade) {
      return scaleX(trade['time']);
    })
    .attr('cy', function(trade) {

      return scaleY(trade['price']);
    })
    .attr('r', 1.5)
    .attr('fill', function(trade) {
      return trade['tradeType'] === 'E'
        ? 'black'
        : 'red';
    });

  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  g.append("g")
      .call(yAxis)
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)");
});
