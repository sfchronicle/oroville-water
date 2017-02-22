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

function opacity_by_year(year,flag) {
  if (flag == 0) {
    return 1;
  } else {
    if (year == "2017") {
      return 1;
    } else {
      return 0.6;
    }
  }
}

// function stroke_by_dataset(dataset) {
//   console.log(dataset);
//   if (dataset == "outflow") {
//     return ("3,0");
//   } else {
//     return ("10,2");
//   }
// }

// setting sizes of interactive
var margin = {
  top: 15,
  right: 100,
  bottom: 50,
  left: 70
};
if (screen.width > 768) {
  var width = 1000 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
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

// tracking which slide the reader is on
var slide_id = 0;
var max_slide = 10;

// tracking if we want to show the legend and which elements
var legend = document.getElementById("legend-container");
var legend_overlay = document.getElementById("legend-container-overlay");
var element_2017 = document.getElementById("element2017");

slide_lookup(0);

// event listeners for the buttons
document.querySelector('#back').addEventListener('click', function(){
  if (slide_id > 0) {
    d3.select("#chart").select("svg").remove();
    d3.select("#reservoir-chart").select("svg").remove();
    document.getElementById("progress"+slide_id).classList.remove("active");
    slide_id = slide_id - 1;
    document.getElementById("progress"+slide_id).classList.add("active");
    slide_lookup(slide_id);
  }
  console.log(slide_id);
});

document.querySelector('#forward').addEventListener('click', function(){
  if (slide_id < slideData.length-1) {
    d3.select("#chart").select("svg").remove();
    d3.select("#reservoir-chart").select("svg").remove();
    document.getElementById("progress"+slide_id).classList.remove("active");
    slide_id = slide_id + 1;
    document.getElementById("progress"+slide_id).classList.add("active");
    slide_lookup(slide_id);
  }
  console.log(slide_id);
});

// // putting everything on a timer
// var loop = null;
// var tick = function() {
//   slide_lookup(slide_id);
//   slide_id = (slide_id + 1) % slideData.length;
//   loop = setTimeout(tick, slide_id == 0 ? 5000 : 5000);
//   // loop = setTimeout(tick, i == 0 ? 1700 : 1000);
// };
//
// tick();

// var selectedData_filter1 = waterData.filter(function(data) { return data.waterYear == "2017" });
// var selectedData = selectedData_filter1.filter(function(data) { return data.type == "outflow" });
// draw_chart(selectedData);

function slide_lookup(id) {

  // clear previous elements
  d3.select("#chart").select("svg").remove();
  d3.select("#reservoir-chart").select("svg").remove();
  document.querySelector(".chart-top").innerHTML = "";
  legend.classList.remove("active");
  legend_overlay.classList.remove("active");

  if (slideData[id]["type"] == "text") {
    document.querySelector(".chart-text").innerHTML = slideData[id]["text"];
  } else if (slideData[id]["type"] == "chart") {
    // special chart with 2 y-axes
    if (id == 4) {
      legend_overlay.classList.add("active");
      draw_overlay();
    // other charts that just show inflow / outflow data
    } else {
      legend.classList.add("active");
      if ((slideData[id]["year"]).length > 4) {
        var selectedData_filter1 = [];
        waterData.forEach(function(data) {
          if ((data.waterYear >= slideData[id]["year"].split("-")[0]) && (data.waterYear <= slideData[id]["year"].split("-")[1])) {
            selectedData_filter1.push(data);
          }
        });
        var selectedData = selectedData_filter1.filter(function(data) { return data.type == slideData[id]["flow_type"] });
        var flag = 0;
        element_2017.classList.add("inactive");
      } else {
        // var selectedData_filter1 = waterData.filter(function(data) { return data.waterYear == slideData[id]["year"] });
        var selectedData = waterData.filter(function(data) { return data.type == slideData[id]["flow_type"] });
        var flag = 1;
        element_2017.classList.remove("inactive");
      }
      draw_chart(selectedData,flag);
    }
    document.querySelector(".chart-top").innerHTML = slideData[id]["image_text"];
  } else if (slideData[id]["type"] == "graphic"){
    document.querySelector(".chart-image").innerHTML = "<div class='inline-image'><img src='"+slideData[id]["image"]+"'></img></div>";
    document.querySelector(".chart-top").innerHTML = "<div class='graphic-text'>"+slideData[id]["image_text"]+"</div>";
  } else if (slideData[id]["type"] == "image") {
    document.querySelector(".chart-image").innerHTML = "<div class='inline-image'><img src='"+slideData[id]["image"]+"'></img></div>";
    document.querySelector(".chart-top").innerHTML = "<div class='graphic-text'>"+slideData[id]["image_text"]+"</div>";
  }
}

function draw_chart(selectedData,flag) {

  // create SVG container for chart components
  var svgFlow = d3.select(".chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // x-axis scale
  var x = d3.time.scale()
      .range([0,width]);

  // y-axis scale
  var y = d3.scale.linear()
      .range([height, 0]);

  x.domain([parseFullDate('10/01/2015'), parseFullDate('09/31/2016')]);
  y.domain([0,170]);

  // Define the axes
  var xAxis = d3.svg.axis().scale(x)
      .orient("bottom")
      .tickFormat(d3.time.format("%b")); // tickFormat

  var yAxis = d3.svg.axis().scale(y)
      .orient("left");

  var FlowNested = d3.nest()
    .key(function(d){ return d.waterYear; })
    .entries(selectedData);

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

  FlowNested.forEach(function(d,ddx) {
    d.values.splice(0,1);
    var class_list = "line voronoi id_Flow"+d.key;
    svgFlow.append("path")
      .attr("class", class_list)
      .style("opacity",opacity_by_year(d.key,flag))
      // .style("stroke-dasharray", stroke_by_dataset(d.values[0].type))
      .style("stroke", color_by_year(d.key))//cscale(d.key))//
      .attr("d", lineFlow(d.values));
  });

  var flatDataFlow = []; //var flatDataOutflow = [];
  selectedData.forEach(function(d,idx){
    var datetemp = d.Date.split("/");
    var datetemp2 = datetemp[0]+"/"+datetemp[1];
    if (datetemp[0] >= 10) {
      var datetemp3 = datetemp[0]+"/"+datetemp[1]+"/2015";
    } else {
      var datetemp3 = datetemp[0]+"/"+datetemp[1]+"/2016";
    }
    var datetemp3 = parseFullDate(datetemp3);
    flatDataFlow.push(
      {key: d.waterYear, Flow: d.Flow, DateString: d.Date, Date: datetemp3}
    );
  });

  var nodesFlow = svgFlow.selectAll(".path")
      .data(flatDataFlow)
      .enter().append("g")
      .attr("class","node");

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
      // .text(function(d) {
      //     if (d.DateString == "2/9/17"){
      //         return "Feb 9, 2017: "+Math.round(d.Flow/1000)+ " kfcs";
      //     } else {
      //         return "";
      //     }
      // });
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
      }

      if (screen.width <= 480) {
        svgFlow.append("g")
            .data(flatDataFlow)
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
            .text("Flow at Oroville reservoir (kcfs)")
      } else {
        svgFlow.append("g")
            .data(flatDataFlow)
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
            .text(slideData[slide_id]["flow_type"]+" (kcfs)")
      }

}

// build reservoir chart
function draw_reservoirs() {
  margin.left = 100;
  // create SVG container for chart components
  var svgReservoir = d3.select("#reservoir-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  reservoirData.forEach(function(d) {
      d.Storage = +d.Storage;
  });

  // x-axis scale
  var xR = d3.time.scale()
      .range([0,width]);

  // y-axis scale
  var yR = d3.scale.linear()
      .range([height, 0]);

  xR.domain([parseFullDate('10/01/2016'), parseFullDate('02/22/2017')]);
  yR.domain([0,1000]);

  // Define the axes
  var xAxisR = d3.svg.axis().scale(xR)
      .orient("bottom")
      .tickFormat(d3.time.format("%m/%d")); // tickFormat

  var yAxisR = d3.svg.axis().scale(yR)
      .orient("left");

  var line901 = [
    {Date: '10/01/2016', Height: 901},
    {Date: '02/22/2017', Height: 901}
  ];
  //
  var lineReservoirs = d3.svg.line()
      // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
      .x(function(d) {
        return xR(parseFullDate(d.Date));
      })
      .y(function(d) {
        return yR(d.Height);
      });

  var areaReservoirs = d3.svg.area()
      // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
      .x(function(d) {
        return xR(parseFullDate(d.Date));
      })
      .y0(height)
      .y1(function(d) {
        return yR(d.Height);
      });

  // Add the filled area
  svgReservoir.append("path")
      .datum(reservoirData)
      .attr("class", "area")
      .style("fill","#6790B7")
      .attr("d", areaReservoirs);

  // svgReservoir.append("path")
  //   .attr("class", "line")
  //   .style("stroke","green")
  //   .attr("d", lineReservoirs(reservoirData));

  var path901 = svgReservoir.append("path")
    .attr("d", lineReservoirs(line901))
    .attr("class","annotation")
    .attr("stroke", "#696969")
    .attr("fill", "none")
    .style("shape-rendering","crispEdges")

  svgReservoir.append("text")
      .attr("x", function(d) {
        return xR(parseFullDate("08/01/2017"));
      })
      .attr("y", function(d) {
        return yR(850);
      })
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .text("Maximum reservoir capacity");

  // if (screen.width <= 480) {
    svgReservoir.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisR)
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
  // } else {
  //   svgReservoir.append("g")
  //       .attr("class", "x axis")
  //       .attr("transform", "translate(0," + height + ")")
  //       .call(xAxisR)
  //       .append("text")
  //       .attr("class", "label")
  //       .attr("x", width)
  //       .attr("y", 40)
  //       .style("text-anchor", "end")
  //       .text("Month");
  // }

  if (screen.width <= 480) {
    svgReservoir.append("g")
        .data(reservoirData)
        .attr("class", "y axis")
        .call(yAxisR)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", 0)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        // .style("fill","white")
        .text("Elevation (Feet)")
  } else {
    svgReservoir.append("g")
        .data(reservoirData)
        .attr("class", "y axis")
        .call(yAxisR)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("x", -10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        // .style("fill","white")
        .text("Elevation (Feet)")
  }
}

function draw_overlay() {
  // create SVG container for chart components
  margin.bottom = 100;
  var svgOverlay = d3.select(".chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // x-axis scale
  var xMonth = d3.time.scale()
      .range([0,width]);

  // y-axis scale
  var yInflow = d3.scale.linear()
      .range([height, 0]);

  var yRightHeight = d3.scale.linear()
      .range([height, 0]);

  // Define the axes
  var xAxisMonth = d3.svg.axis().scale(xMonth)
      .orient("bottom")
      .tickFormat(d3.time.format("%m/%d")); // tickFormat

  var yAxisInflow = d3.svg.axis().scale(yInflow)
      .orient("left");

  var yAxisRightHeight = d3.svg.axis().scale(yRightHeight)
      .orient("right")

  xMonth.domain([parseFullDate('10/01/2016'), parseFullDate('02/22/2017')]);
  yInflow.domain([0,140]);
  yRightHeight.domain([0,20]);

  var areaReservoirs = d3.svg.area()
      // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
      .x(function(d) {
        return xMonth(parseFullDate(d.Date));
      })
      .y0(height)
      .y1(function(d) {
        return yRightHeight((901-d.Height)/901*100);
      });

  // Add the filled area
  svgOverlay.append("path")
      .datum(reservoirData)
      .attr("class", "area")
      .style("fill","#6790B7")
      .attr("d", areaReservoirs);

  var lineFlow = d3.svg.line()
      // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
      .x(function(d) {
        // return x(parseFullDate(d.Date));
        var datetemp = d.Date.split("/");
        if (datetemp[0] >= 10) {
          var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/2016";
        } else {
          var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/2017";
        }
        // var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/"+d.Year;
        return xMonth(parseFullDate(datetemp2));
      })
      .y(function(d) {
        return yInflow(d.Flow/1000);
      });

  var selectedData_filter1 = waterData.filter(function(data) { return data.waterYear == "2017" });
  var selectedData = selectedData_filter1.filter(function(data) { return data.type == "Outflow" });

  svgOverlay.append("path")
    .attr("class", "path")
    .style("stroke", "red")//cscale(d.key))//
    .attr("d", lineFlow(selectedData));

  // if (screen.width <= 480) {
    svgOverlay.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisMonth)
      .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)" )
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -200)
        .style("text-anchor", "end")
        .text("Date (by rain season)")

    if (screen.width <= 480) {
      svgOverlay.append("g")
          .attr("class", "y axis")
          .call(yAxisInflow)
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 10)
          .attr("x", 0)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          // .style("fill","white")
          .text("Outflow at Oroville reservoir (kcfs)")

      svgOverlay.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + width + " ,0)")
          .call(yAxisRightHeight)
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 10)
          .attr("x", 0)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          // .style("fill","white")
          .text("Reservoir space (% available)")
    } else {
      svgOverlay.append("g")
          .attr("class", "y axis")
          .call(yAxisInflow)
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", -55)
          .attr("x", 0)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          // .style("fill","white")
          .text("Outflow at Oroville reservoir (kcfs)")

      svgOverlay.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + width + " ,0)")
          .call(yAxisRightHeight)
          .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", -20)
          .attr("x", 0)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          // .style("fill","white")
          .text("Reservoir space (% available)")
    }
    // } else {
  //   svgOverlay.append("g")
  //       .attr("class", "x axis")
  //       .attr("transform", "translate(0," + height + ")")
  //       .call(xAxisMonth)
  //       .append("text")
  //       .attr("class", "label")
  //       .attr("x", width)
  //       .attr("y", 40)
  //       .style("text-anchor", "end")
  //       .text("Date");
  // }
  // var lineElevationAvg = d3.svg.line()
  //     .interpolate("monotone")
  //     .x(function(d) {
  //       return xMilePace(d.distance);
  //     })
  //     .y(function(d) {
  //       return yRightMilePace(d.elevation);
  //     });
  //
  // svgMilePace.append("path")
  //   .attr("class","elevationprofile")
  //   .attr("d",lineElevationAvg(elevationData));
  //
  // var lineMilePace = d3.svg.line()
  //     .interpolate("monotone")
  //     .x(function(d) {
  //       return xMilePace(d.mile);
  //     })
  //     .y(function(d) {
  //       return yMilePace(d.pace);
  //     });
  //
  // // plotting histogram of ages for last 6 years
  // pacePerGroup.forEach(function(d,idx) {
  //   var class_list = "line voronoipath "+group_list_paces[idx];
  //   svgMilePace.append("path")
  //     .attr("class",class_list)
  //     .style("stroke", color_by_group(group_list_paces[idx]))
  //     .attr("d", lineMilePace(d));
  // });
  //
  // var focusMilePace = svgMilePace.append("g")
  //     .attr("transform", "translate(-100,-100)")
  //     .attr("class", "focus");
  //
  // focusMilePace.append("circle")
  //     .attr("r", 3.5);
  //
  // focusMilePace.append("rect")
  //     .attr("x",-110)
  //     .attr("y",-25)
  //     .attr("width","150px")
  //     .attr("height","20px")
  //     .attr("opacity","0.8")
  //     .attr("fill","white");
  //
  // focusMilePace.append("text")
  //     .attr("x", -100)
  //     .attr("y", -10);
  //
  // var voronoiGroupMilePace = svgMilePace.append("g")
  //     .attr("class", "voronoiMilePace");
  //
  // // console.log(flatData);
  // voronoiGroupMilePace.selectAll(".voronoiMilePace")
  //   .data(voronoiMilePace(flatDataPerMile))
  //   .enter().append("path")
  //   .attr("d", function(d) {
  //     // console.log(d);
  //     if (d) {
  //       return "M" + d.join("L") + "Z";
  //     }
  //   })
  //   .datum(function(d) {
  //     if (d) {
  //       return d.point;
  //     }
  //   })
  //   .on("mouseover", mouseoverMilePace)
  //   .on("mouseout", mouseoutMilePace);
  //
  // function mouseoverMilePace(d) {
  //   d3.select("."+d.key).classed("line-hover", true);
  //   focusMilePace.attr("transform", "translate(" + xMilePace(d.mile) + "," + yMilePace(d.pace) + ")");
  //   focusMilePace.select("text").text("Mile "+d.mile+", "+d.paceText+ " per mile");
  // }
  //
  // function mouseoutMilePace(d) {
  //   d3.select("."+d.key).classed("line-hover", false);
  //   focusMilePace.attr("transform", "translate(-100,-100)");
  // }
  //
  // if (screen.width <= 480) {
  //   svgMilePace.append("g")
  //       .attr("class", "x axis")
  //       .attr("transform", "translate(0," + height + ")")
  //       .call(xAxisMilePace)
  //       .append("text")
  //       .attr("class", "label")
  //       .attr("x", width)
  //       .attr("y", 35)
  //       .style("text-anchor", "end")
  //       .text("Mile");
  // } else {
  //   svgMilePace.append("g")
  //       .attr("class", "x axis")
  //       .attr("transform", "translate(0," + height + ")")
  //       .call(xAxisMilePace)
  //       .append("text")
  //       .attr("class", "label")
  //       .attr("x", width)
  //       .attr("y", 40)
  //       .style("text-anchor", "end")
  //       .text("Mile");
  // }
  //
  // if (screen.width <= 480) {
  //   svgMilePace.append("g")
  //       .attr("class", "y axis")
  //       .call(yAxisMilePace)
  //       .append("text")
  //       .attr("class", "label")
  //       .attr("transform", "rotate(-90)")
  //       .attr("y", 10)
  //       .attr("x", 0)
  //       .attr("dy", ".71em")
  //       .style("text-anchor", "end")
  //       // .style("fill","white")
  //       .text("Pace per mile (min/mi)")
  //
  //   svgMilePace.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxisRightMilePace)
  //     .attr("transform", "translate(" + width + " ,0)")
  //     .append("text")
  //       .attr("class", "label")
  //       .attr("transform", "rotate(-90)")
  //       .attr("y", -20)
  //       .attr("x", 0)
  //       .attr("dy", ".71em")
  //       .style("text-anchor", "end")
  //       .text("Elevation (ft)")
  //
  // } else {
  //   svgMilePace.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxisMilePace)
  //     .append("text")
  //       .attr("class", "label")
  //       .attr("transform", "rotate(-90)")
  //       .attr("y", -70)
  //       .attr("x", -10)
  //       .attr("dy", ".71em")
  //       .style("text-anchor", "end")
  //       // .style("fill","white")
  //       .text("Pace per mile (min/mi)")
  //
  //   svgMilePace.append("g")
  //     .attr("class", "y axis")
  //     .call(yAxisRightMilePace)
  //     .attr("transform", "translate(" + width + " ,0)")
  //     .append("text")
  //       .attr("class", "label")
  //       .attr("transform", "rotate(-90)")
  //       .attr("y", 60)
  //       .attr("x", -10)
  //       .attr("dy", ".71em")
  //       .style("text-anchor", "end")
  //       .text("Elevation (ft)")
  //
  // }



}
