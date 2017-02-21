var d3 = require('d3');

// Parse the date / time
var parseDate = d3.time.format("%m/%d").parse;

// Parse the date / time
var parseFullDate = d3.time.format("%m/%d/%Y").parse;

var cscale = d3.scale.category20b();

function color_by_year(year) {
  if (year == "2017") {
    return "red";
  } else {
    return cscale(year);
  }
}

function stroke_by_dataset(dataset) {
  console.log(dataset);
  if (dataset == "outflow") {
    return ("3,0");
  } else {
    return ("10,2");
  }
}

// setting sizes of interactive
var margin = {
  top: 15,
  right: 100,
  bottom: 50,
  left: 100
};
if (screen.width > 768) {
  var width = 1000 - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;
} else if (screen.width <= 768 && screen.width > 480) {
  var width = 650 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
} else if (screen.width <= 480 && screen.width > 340) {
  console.log("big phone");
  var margin = {
    top: 20,
    right: 45,
    bottom: 35,
    left: 30
  };
  var width = 340 - margin.left - margin.right;
  var height = 350 - margin.top - margin.bottom;
} else if (screen.width <= 340) {
  console.log("mini iphone")
  var margin = {
    top: 20,
    right: 55,
    bottom: 35,
    left: 30
  };
  var width = 310 - margin.left - margin.right;
  var height = 350 - margin.top - margin.bottom;
}

// create SVG container for chart components
var svgFlow = d3.select(".inflow-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// var svgOutflow = d3.select(".outflow-chart").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// x-axis scale
var x = d3.time.scale()
    .range([0,width]);

// y-axis scale
var y = d3.scale.linear()
    .range([height, 0]);

// var voronoiFlow = d3.geom.voronoi()
//     .x(function(d) {
//       return x(d.Date);
//     })
//     .y(function(d) {
//       return y(d.Flow/1000);
//     })
//     .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

// var voronoiOutflow = d3.geom.voronoi()
//     .x(function(d) {
//       return x(d.Date);
//     })
//     .y(function(d) {
//       return y(d.Outflow/1000);
//     })
//     .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%b")); // tickFormat

var yAxis = d3.svg.axis().scale(y)
    .orient("left");

var FlowNested = d3.nest()
  .key(function(d){ return d.waterYear; })
  .entries(waterData);

// var OutflowNested = d3.nest()
//   .key(function(d){ return d.waterYear; })
//   .entries(waterData);

x.domain([parseFullDate('10/01/2015'), parseFullDate('09/31/2016')]);
y.domain([0,170]);

var lineFlow = d3.svg.line()
    // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
    .x(function(d) {
      // return x(parseFullDate(d.Date));
      var datetemp = d.Date.split("/");
      if (datetemp[0] >= 10) {
        var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/2015";
      } else {
        var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/2016";
      }
      // var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/"+d.Year;
      return x(parseFullDate(datetemp2));
    })
    .y(function(d) {
      return y(d.Flow/1000);
    });

// var lineOutflow = d3.svg.line()
//     // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
//     .x(function(d) {
//       // return x(parseFullDate(d.Date));
//       var datetemp = d.Date.split("/");
//       if (datetemp[0] >= 10) {
//         var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/2015";
//       } else {
//         var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/2016";
//       }
//       // var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/"+d.Year;
//       return x(parseFullDate(datetemp2));
//     })
//     .y(function(d) {
//       return y(d.Outflow/1000);
//     });

FlowNested.forEach(function(d) {
  var class_list = "line voronoi id_Flow"+d.key;
  svgFlow.append("path")
    .attr("class", class_list)
    .style("stroke-dasharray", stroke_by_dataset(d.values[0].type))
    .style("stroke", color_by_year(d.key))//cscale(d.key))//
    .attr("d", lineFlow(d.values));
});

// OutflowNested.forEach(function(d) {
//   var class_list = "line voronoi id_outflow"+d.key;
//   svgOutflow.append("path")
//     .attr("class", class_list)
//     .style("stroke", color_by_year(d.key))//cscale(d.key))//
//     .attr("d", lineOutflow(d.values));
// });

// var focusFlow = svgFlow.append("g")
//     .attr("transform", "translate(-100,-100)")
//     .attr("class", "focus");
//
// var focusOutflow = svgOutflow.append("g")
//     .attr("transform", "translate(-100,-100)")
//     .attr("class", "focus");
//
// if (screen.width >= 480) {
//   focusFlow.append("circle")
//       .attr("r", 3.5);
//
//   focusFlow.append("rect")
//       .attr("x",-110)
//       .attr("y",-25)
//       .attr("width","170px")
//       .attr("height","20px")
//       .attr("opacity","0.5")
//       .attr("fill","white");
//
//   focusFlow.append("text")
//       .attr("x", -100)
//       .attr("y", -10);
//
//   focusOutflow.append("circle")
//       .attr("r", 3.5);
//
//   focusOutflow.append("rect")
//       .attr("x",-110)
//       .attr("y",-25)
//       .attr("width","170px")
//       .attr("height","20px")
//       .attr("opacity","0.5")
//       .attr("fill","white");
//
//   focusOutflow.append("text")
//       .attr("x", -100)
//       .attr("y", -10);
// }
//
// var voronoiGroupFlow = svgFlow.append("g")
//     .attr("class", "voronoi");
//
// var voronoiGroupOutflow = svgOutflow.append("g")
//     .attr("class", "voronoi");
//
var flatDataFlow = []; //var flatDataOutflow = [];
waterData.forEach(function(d,idx){
  var datetemp = d.Date.split("/");
  var datetemp2 = datetemp[0]+"/"+datetemp[1];
  if (datetemp[0] >= 10) {
    var datetemp3 = datetemp[0]+"/"+datetemp[1]+"/2015";
  } else {
    var datetemp3 = datetemp[0]+"/"+datetemp[1]+"/2016";
  }
  var datetemp3 = parseFullDate(datetemp3);
  // var datetemp = d.Date.split("/");
  // var datetemp2 = datetemp[0]+"/"+datetemp[1];
  // var datetemp3 = parseFullDate(datetemp2);
  flatDataFlow.push(
    {key: d.waterYear, Flow: d.Flow, DateString: d.Date, Date: datetemp3}
  );
  // flatDataOutflow.push(
  //   {key: d.waterYear, Outflow: d.Outflow, DateString: d.Date, Date: datetemp3}
  // );
});
//
// voronoiGroupFlow.selectAll(".voronoi")
//   .data(voronoiFlow(flatDataFlow))
//   .enter().append("path")
//   .attr("d", function(d) {
//     if (d) {
//       return "M" + d.join("L") + "Z";
//     }
//   })
//   .datum(function(d) {
//     if (d) {
//       return d.point;
//     }
//   })
//   .on("mouseover", mouseoverFlow)
//   .on("mouseout", mouseoutFlow);
//
// voronoiGroupOutflow.selectAll(".voronoi")
//   .data(voronoiOutflow(flatDataOutflow))
//   .enter().append("path")
//   .attr("d", function(d) {
//     if (d) {
//       return "M" + d.join("L") + "Z";
//     }
//   })
//   .datum(function(d) {
//     if (d) {
//       return d.point;
//     }
//   })
//   .on("mouseover", mouseoverOutflow)
//   .on("mouseout", mouseoutOutflow);
//
// function mouseoverFlow(d) {
//   d3.select(".id_Flow"+d.key).classed("line-hover", true);
//   d3.select(".Flow-info").text(d.key);
//   focusFlow.attr("transform", "translate(" + x(d.Date) + "," + y(d.Flow/1000) + ")");
//   focusFlow.select("text").text(d.DateString+": "+Math.round(d.Flow/1000)+ " (kcfs)");
// }
//
// function mouseoutFlow(d) {
//   d3.select(".id_Flow"+d.key).classed("line-hover", false);
//   focusFlow.attr("transform", "translate(-100,-100)");
//   d3.select(".Flow-info").text("");
// }
//
// function mouseoverOutflow(d) {
//   d3.select(".id_outflow"+d.key).classed("line-hover", true);
//   d3.select(".outflow-info").text(d.key);
//   focusOutflow.attr("transform", "translate(" + x(d.Date) + "," + y(d.Outflow/1000) + ")");
//   focusOutflow.select("text").text(d.DateString+": "+Math.round(d.Outflow/1000)+ " (kcfs)");
// }
//
// function mouseoutOutflow(d) {
//   d3.select(".id_outflow"+d.key).classed("line-hover", false);
//   focusOutflow.attr("transform", "translate(-100,-100)");
//   d3.select(".outflow-info").text("");
// }

var nodesFlow = svgFlow.selectAll(".path")
    .data(flatDataFlow)
    .enter().append("g")
    .attr("class","node");

// var nodesOutflow = svgOutflow.selectAll(".path")
//     .data(flatDataOutflow)
//     .enter().append("g")
//     .attr("class","node");

// if (screen.width <= 480){
// nodes.append("text")
//     .attr("x", function(d) {
//       return (x(d.Date)-40);
//     })
//     .attr("y", function(d) {
//       return y(d.Flow)-10;
//     })
//     .attr("class","dottextslope")
//     .style("fill","black")//"#3F3F3F")
//     .style("font-size","14px")
//     .style("font-family","AntennaMedium")
//     // .style("font-style","italic")
//     .text(function(d) {
//         if (d.DateString == "1/10/17"){
//             return d.DateString+": "+d.Flow+ " inches";
//         } else {
//             return "";
//         }
//     });
// } else {
nodesFlow.append("text")
    .attr("x", function(d) {
      return (x(d.Date)-10);
    })
    .attr("y", function(d) {
      return y(d.Flow/1000)-30;
    })
    .attr("class","dottextslope")
    .style("fill","black")//"#3F3F3F")
    .style("font-size","14px")
    .style("font-family","AntennaMedium")
    // .style("font-style","italic")
    .text(function(d) {
        if (d.DateString == "2/9/17"){
            return "Feb 9, 2017: "+Math.round(d.Flow/1000)+ " kfcs";
        } else {
            return "";
        }
    });
  // nodesOutflow.append("text")
  //     .attr("x", function(d) {
  //       return (x(d.Date)-10);
  //     })
  //     .attr("y", function(d) {
  //       return y(d.Outflow/1000)-30;
  //     })
  //     .attr("class","dottextslope")
  //     .style("fill","black")//"#3F3F3F")
  //     .style("font-size","14px")
  //     .style("font-family","AntennaMedium")
  //     // .style("font-style","italic")
  //     .text(function(d) {
  //         if (d.DateString == "2/13/17"){
  //             return "Feb 13, 2017: "+Math.round(d.Outflow/1000)+ " kfcs";
  //         } else {
  //             return "";
  //         }
  //     });
// }

if (screen.width <= 480) {
  svgFlow.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)" )
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", 35)
      .style("text-anchor", "end")
      .text("Month")
  // svgOutflow.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(xAxis)
  //   .selectAll("text")
  //       .style("text-anchor", "end")
  //       .attr("dx", "-.8em")
  //       .attr("dy", ".15em")
  //       .attr("transform", "rotate(-65)" )
  //     .append("text")
  //     .attr("class", "label")
  //     .attr("x", width)
  //     .attr("y", 35)
  //     .style("text-anchor", "end")
  //     .text("Month")
} else {
  svgFlow.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", 40)
      .style("text-anchor", "end")
      .text("Month");
  // svgOutflow.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(xAxis)
  //     .append("text")
  //     .attr("class", "label")
  //     .attr("x", width)
  //     .attr("y", 40)
  //     .style("text-anchor", "end")
  //     .text("Month");
}

if (screen.width <= 480) {
  svgFlow.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("x", 0)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      // .style("fill","white")
      .text("Flow (kcfs)")
  // svgOutflow.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxis)
  //     .append("text")
  //     .attr("class", "label")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 10)
  //     .attr("x", 0)
  //     .attr("dy", ".71em")
  //     .style("text-anchor", "end")
  //     // .style("fill","white")
  //     .text("Outflow (kcfs)")
} else {
  svgFlow.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      // .style("fill","white")
      .text("Flow (kcfs)")
  // svgOutflow.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxis)
  //     .append("text")
  //     .attr("class", "label")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", -50)
  //     .attr("x", -10)
  //     .attr("dy", ".71em")
  //     .style("text-anchor", "end")
  //     // .style("fill","white")
  //     .text("Outflow (kcfs)")
}
