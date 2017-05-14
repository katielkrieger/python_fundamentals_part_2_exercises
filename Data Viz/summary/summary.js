document.addEventListener("DOMContentLoaded", function() {

	// set the SVG dimensions
	var height = 800;
	var width = 2200;
    var padding = 60; 
    var paddingLeft = 200;
    var svg = d3.select('svg')
                  .attr('width', width)
                  .attr('height', height);

    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip");

    var colors = {
        "San Francisco": d3.color("#15B1CC"),
        "Oakland": d3.color("#FF7573"),
        "Redwood City": d3.color("#258899"),
        "San Rafael": d3.color("#CC1567")
    }

    var months = {
        "0": "January",
        "1": "February",
        "2": "March",
        "3": "April",
        "4": "May",
        "5": "June",
        "6": "July",
        "7": "August",
        "8": "September",
        "9": "October",
        "10": "November",
        "11": "December",
    }

    var numStations = Object.keys(colors).length;
 
    // Get the CSV data
    d3.queue()
        .defer(d3.csv, "/summary/Exceedances_by_month.csv")
        .await(function(error, data) {
            if (error) console.log(error);

            // data is stored as an array of objects with keys:
            //  - Station
            //  - Month
            //  - Avg

            // Convert Avg values to floats and Months to dates
            console.log(data);
            data = data.map(function(val) {
                val.Avg = parseFloat(val.Avg);
                val.Date = new Date(2016, parseFloat(val.Month), 15);
                return val;
            });
          //  console.log(data);

            // define basic dimensions and scaling
            var yScale = d3.scaleOrdinal()
                           .domain(["", "San Francisco", "Oakland", "Redwood City", "San Rafael", ""])
                           .range([padding*2, padding + height/5, padding + 2*height/5, padding + 3*height/5, padding + 4*height/5, height]); // NOT flipping y axis
            var xScale = d3.scaleTime()
                           .domain([new Date(2016, 0, 1), new Date(2016, 11, 31)]) // 0: January, 11: December
                           .range([paddingLeft, width - paddingLeft]);
            var colorScale = d3.scaleLinear()
                   .domain(["San Francisco", "Oakland", "Redwood City", "San Rafael"])
                   .range([colors["SanFrancisco"], colors["oakland"], colors["redwoodCity"], colors["sanRafael"]]);

            // set up axes, accounting for scaling and padding
            var horizontalAxis = d3.axisBottom(xScale)
                                   .tickValues([new Date(2016, 0, 15), new Date(2016, 1, 15),
                                                new Date(2016, 2, 15), new Date(2016, 3, 15),
                                                new Date(2016, 4, 15), new Date(2016, 5, 15),
                                                new Date(2016, 6, 15), new Date(2016, 7, 15),
                                                new Date(2016, 8, 15), new Date(2016, 9, 15),
                                                new Date(2016, 10, 15), new Date(2016, 11, 15)])
                                   .tickFormat(d3.timeFormat("%B"));

            svg.append("g")
                .attr("transform", `translate(0,${height - padding})`)
                .style('font-family', '"Source Sans Pro",Calibri,Candara,Arial,sans-serif')
                .call(horizontalAxis);

            var verticalAxis = d3.axisLeft(yScale);

            svg.append("g")
                .attr("transform", `translate(${paddingLeft}, ${-padding})`)
                .style('font-family', '"Source Sans Pro",Calibri,Candara,Arial,sans-serif')
                .call(verticalAxis);

            // attach data to circles with class "data"
            svg.selectAll("circle")
              .data(data)
              .enter()
                .append('circle')
                .attr('cx', (d, i) => xScale(d.Date))
                .attr('cy', d => yScale(d.Station) - padding) // set to height of the city
                .attr('r', d => 7 * d.Avg) // scaled by number of exceedances
                .attr('fill', d => colors[d.Station]) // colors match detailed graphs
                .attr('stroke', 'black')
                .on("mouseenter", function(d) {
                    tooltip.html(`<strong><span style='color:${colors[d.Station]}'>${months[d.Month]}:</span></strong><br>${d.Avg.toFixed(1)} days`)
                           .style("opacity", .9)
                           .style("left", d3.event.pageX - d3.select(".tooltip").node().getBoundingClientRect().width/2  + "px")
                           .style("top", d3.event.pageY - 200 + "px" )
                })
                .on("mouseout", function() {
                    tooltip.style("opacity", 0)
                });

        });

})