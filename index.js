var margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 50
};
var svg = d3.select("svg");
var width = +svg.attr("width") - margin.left - margin.right;
var height = +svg.attr("height") - margin.top - margin.bottom;
var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseAskTime = d3.timeParse('%H:%M:%S');
var parseTradeTime = d3.timeParse('%H:%M')

var scaleX = d3.scaleTime()
  .rangeRound([0, width]);
var scaleY = d3.scaleLinear()
  .rangeRound([height, 0]);

var xAxis = d3.axisBottom(scaleX);
var yAxis = d3.axisLeft(scaleY)

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

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

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

  yAxis.tickFormat(function(number) {
      return (number / 10000).toFixed(1);
    });

  g.append("path")
    .datum(bboList)
    .attr('class', 'ask-area')
    .attr("fill", "#945E1E")
    .attr("d", askArea);

  g.append('path')
    .datum(bboList)
    .attr('class', 'bid-area')
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
    .attr('r', function(trade) {
      return (trade['shares'] / 50);
    })
    .attr('fill', function(trade) {
      return trade['tradeType'] === 'E'
        ? 'black'
        : 'red';
    })
    .attr('class', function(trade) {
      return trade['tradeType'] === 'E'
        ? 'black trade-circle'
        : 'red trade-circle';
    })
    .on("mouseover", handleMouseOver)
    .on('mouseout', handleMouseOut);

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr('class', 'axis x-axis')
    .call(xAxis);

  g.append("g")
      .attr('class', 'axis y-axis')
      .call(yAxis)
    .append("text")
      .attr('class', 'y-axis-label')
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)");

  var active = true;
  svg.append("text")
    .attr("x", 0)
    .attr("y", height + margin.top + 30)
    .attr("class", "toggle-trades")
    .style("fill", "black")
    .on("click", function(){
      var newOpacity = active ? 0 : 1;
      d3.selectAll(".trade-circle").style("opacity", newOpacity);
      active = !active;
    })
    .text("Toggle Trades");
});

function handleMouseOver(data) {
  console.log(data.shares)
  console.log('data.time: ', data.time);
  g.append("text")
    .attr('id', 'i' + data.orderReferenceNumber)
    .attr('x', function() {
      return scaleX(data.time) - 30;
    })
    .attr('y', function() {
      return scaleY(data.price) - 15;
    })
    .attr('class', 'trade-mouseover')
    .text(function() {
      return data.shares;
    });
}

function handleMouseOut(data) {
  d3.select("#i" + data.orderReferenceNumber)
    .remove();
}
