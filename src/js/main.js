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
var element_2017 = document.getElementById("element2017");

// event listeners for the buttons
document.querySelector('#back').addEventListener('click', function(){
  if (slide_id > 0) {
    d3.select("#chart").select("svg").remove();
    d3.select("#reservoir-chart").select("svg").remove();
    slide_id = slide_id - 1;
    slide_lookup(slide_id);
  }
  console.log(slide_id);
});

document.querySelector('#forward').addEventListener('click', function(){
  if (slide_id < slideData.length-1) {
    d3.select("#chart").select("svg").remove();
    d3.select("#reservoir-chart").select("svg").remove();
    slide_id = slide_id + 1;
    slide_lookup(slide_id);
  }
  console.log(slide_id);
});

// var selectedData_filter1 = waterData.filter(function(data) { return data.waterYear == "2017" });
// var selectedData = selectedData_filter1.filter(function(data) { return data.type == "outflow" });
// draw_chart(selectedData);
slide_lookup(0);

function slide_lookup(id) {

  // clear previous elements
  document.querySelector(".chart-text").innerHTML = "";
  document.querySelector(".chart-image").innerHTML = "";
  document.querySelector(".chart-info").innerHTML = "";
  legend.classList.remove("active");

  if (slideData[id]["type"] == "text") {
    document.querySelector(".chart-text").innerHTML = slideData[id]["text"];
  } else if (slideData[id]["type"] == "chart") {
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
    document.querySelector(".chart-info").innerHTML = slideData[id]["image_text"];
  } else if (slideData[id]["type"] == "graphic"){
    if (id == 4) {
      document.querySelector(".chart-info").innerHTML = slideData[id]["image_text"];
      draw_reservoirs();
    } else {
      document.querySelector(".chart-image").innerHTML = "<div class='inline-image'><img src='"+slideData[id]["image"]+"'></img></div>";
      document.querySelector(".chart-info").innerHTML = "<div class='graphic-text'>"+slideData[id]["image_text"]+"</div>";
    }
  } else if (slideData[id]["type"] == "image") {
    document.querySelector(".chart-image").innerHTML = "<div class='inline-image'><img src='"+slideData[id]["image"]+"'></img></div>";
    document.querySelector(".chart-info").innerHTML = "<div class='graphic-text'>"+slideData[id]["image_text"]+"</div>";
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

  console.log(FlowNested);

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

  // var startLineFlow = d3.svg.line()
  //     .x(function(d) {
  //       return x(parseFullDate("10/01/2015"));
  //       // // return x(parseFullDate(d.Date));
  //       // var datetemp = d.Date.split("/");
  //       // if (datetemp[0] >= 10) {
  //       //   var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/2015";
  //       // } else {
  //       //   var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/2016";
  //       // }
  //       // // var datetemp2 = datetemp[0]+"/"+datetemp[1]+"/"+d.Year;
  //       // return x(parseFullDate(datetemp2));
  //     })
  //     .y(function(d) {
  //       return y(0);
  //     });

  // function pathTween(pathData) {
  //   console.log(pathData);
  //   var interpolate = d3.scale.quantile()
  //     .domain([0,1])
  //     .range(d3.range(1, pathData.length + 1));
  //   console.log(interpolate);
  //   return function(t) {
  //     return lineFlow(pathData.slice(0, interpolate(t)));
  //   };
  // }

  FlowNested.forEach(function(d,ddx) {
    d.values.splice(0,1);
    var class_list = "line voronoi id_Flow"+d.key;
    svgFlow.append("path")
      .attr("class", class_list)
      .style("opacity",opacity_by_year(d.key,flag))
      // .style("stroke-dasharray", stroke_by_dataset(d.values[0].type))
      .style("stroke", color_by_year(d.key))//cscale(d.key))//
      // .transition()
      //   .duration(200*12)
      //   .attrTween('d', pathTween(d.values));
      // .transition()
      // .attr("d", startLineFlow(d.values)) // set starting position
      // .transition()
      //   .delay(ddx*1000)
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

  xR.domain([parseFullDate('10/01/2016'), parseFullDate('09/31/2017')]);
  yR.domain([0,4000]);

  var xMin = xR.domain()[0];
  var xMax = xR.domain()[1];

  // Define the axes
  var xAxisR = d3.svg.axis().scale(xR)
      .orient("bottom")
      .tickFormat(d3.time.format("%b")); // tickFormat

  console.log(xAxisR);

  var yAxisR = d3.svg.axis().scale(yR)
      .orient("left");

  var line901 = [
    {x: xMin, y: 901},
    {x: xMax, y: 901}
  ];
  //
  // var lineReservoirs = d3.svg.line()
  //     // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
  //     .x(function(d) {
  //       return xR(parseFullDate(d.Date));
  //     })
  //     .y(function(d) {
  //       return yR(d.Storage/10000);
  //     });

  var areaReservoirs = d3.svg.area()
      // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
      .x(function(d) {
        return xR(parseFullDate(d.Date));
      })
      .y0(height)
      .y1(function(d) {
        return yR(d.Storage/1000);
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

  // var path901 = svgReservoir.append("path")
  //   .attr("d", lineReservoirs(line901))
  //   .attr("stroke", "red")
  //   .attr("stroke-width", "2")
  //   .attr("fill", "none");

  if (screen.width <= 480) {
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
  } else {
    svgReservoir.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisR)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 40)
        .style("text-anchor", "end")
        .text("Month");
  }

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
        .text("Storage (KAF)")
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
        .text("Storage (KAF)")
  }
}
