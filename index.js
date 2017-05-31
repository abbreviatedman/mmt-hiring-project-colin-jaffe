var margin = {
  top: 80,
  right: 20,
  bottom: 80,
  left: 50
};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var svg = d3.select('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);
var g = svg.append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var parseAskTime = d3.timeParse('%H:%M:%S');
var parseTradeTime = d3.timeParse('%H:%M');

var scaleX = d3.scaleTime()
  .rangeRound([0, width]);
var scaleY = d3.scaleLinear()
  .rangeRound([height, 0]);

var xAxis = d3.axisBottom(scaleX);
var yAxis = d3.axisLeft(scaleY);

var askArea = d3.area()
  .x(function(d) {
    return scaleX(d.timeStr);
  })
  .y1(0)
  .curve(d3.curveStepAfter);

var bidArea = d3.area()
  .x(function(d) {
    return scaleX(d.timeStr);
  })
  .y1(function(d) {
    return scaleY(d.bid);
  })
  .curve(d3.curveStepAfter);

d3.json('stock.json', function(error, data) {
  if (error) throw error;

  var bboList = data.bboList.map(function(bbo) {
    bbo.timeStr = bbo.timeStr.slice(0, 8);
    bbo.timeStr = parseAskTime(bbo.timeStr);
    return bbo;
  });

  var tradeList = data.tradeList.map(function(trade) {
    var minutes = (trade.time / 60000000000).toFixed();
    var hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    var timeString = hours.toString() + ':' + minutes.toString();
    trade.time = parseTradeTime(timeString);
    return trade;
  });

  scaleX.domain([bboList[0].timeStr, bboList[bboList.length - 1].timeStr]);
  scaleY.domain([227500, 240000]);

  askArea.y0(function(d) {
    return scaleY(d.ask);
  });
  bidArea.y0(height);

  yAxis.tickFormat(function(number) {
      return (number / 10000).toFixed(1);
    });

  g.append('path')
    .datum(bboList)
    .attr('class', 'ask-area')
    .attr('d', askArea);

  g.append('path')
    .datum(bboList)
    .attr('class', 'bid-area')
    .attr('d', bidArea);

  g.selectAll('circle')
    .data(tradeList)
    .enter().append('circle')
    .attr('cx', function(trade) {
      return scaleX(trade.time);
    })
    .attr('cy', function(trade) {
      return scaleY(trade.price);
    })
    .attr('r', function(trade) {
      return ((trade.shares / 100) + 1);
    })
    .attr('fill', function(trade) {
      return trade.tradeType === 'E'
        ? 'black'
        : 'red';
    })
    .attr('class', 'trade-circle')
    .on('mouseover', handleMouseover)
    .on('mouseout', handleMouseout);

  g.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'axis x-axis')
    .call(xAxis);

  g.append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis)
    .append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Price ($)');

  var tradesActive = true;
  svg.append('text')
    .attr('x', 10)
    .attr('y', height + margin.top + 60)
    .attr('class', 'toggle-trades')
    .on('click', function(){
      var newOpacity = tradesActive ? 0 : 1;
      d3.selectAll('.trade-circle').style('opacity', newOpacity);
      tradesActive = !tradesActive;
      d3.select('.toggle-trades')
        .text(function() {
          return tradesActive
            ? 'Hide Trades'
            : 'Show Trades'
        });
    })
    .text('Hide Trades');

  var asksActive = true;
  svg.append('text')
    .attr('x', 160)
    .attr('y', height + margin.top + 60)
    .attr('class', 'toggle-asks')
    .on('click', function(){
      var newOpacity = asksActive ? 0 : 1;
      d3.select('.ask-area').style('opacity', newOpacity);
      asksActive = !asksActive;
      d3.select('.toggle-asks')
        .text(function() {
          return asksActive
            ? 'Hide Asks'
            : 'Show Asks'
        });
    })
    .text('Hide Asks');

  var bidsActive = true;
  svg.append('text')
    .attr('x', 310)
    .attr('y', height + margin.top + 60)
    .attr('class', 'toggle-bids')
    .on('click', function(){
      var newOpacity = bidsActive ? 0 : 1;
      d3.select('.bid-area').style('opacity', newOpacity);
      bidsActive = !bidsActive;
      d3.select('.toggle-bids')
        .text(function() {
          return bidsActive
            ? 'Hide Bids'
            : 'Show Bids'
        });
    })
    .text('Hide Bids');

  svg.append('text')
    .attr('x', 480)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .text('As this graph demonstrates, someone should hire me quick.');
});

function handleMouseover(data) {
  g.append('text')
    .attr('id', 'i' + data.orderReferenceNumber)
    .attr('x', function() {
      return scaleX(data.time) - 15;
    })
    .attr('y', function() {
      return scaleY(data.price) - 10;
    })
    .attr('class', 'trade-mouseover')
    .text(function() {
      return data.shares;
    });
}

function handleMouseout(data) {
  d3.select('#i' + data.orderReferenceNumber)
    .remove();
}
