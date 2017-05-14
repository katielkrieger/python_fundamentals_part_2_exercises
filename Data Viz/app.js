document.addEventListener("DOMContentLoaded", function() {

	// set the SVG dimensions
	var height = 800;
	var width = 2000;
    var padding = 60; 
    var svg = d3.select('svg')
                  .attr('width', width)
                  .attr('height', height);

    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip");

    var stations = {
        "San Francisco Arkansas St": 1,
        "Oakland West": 1,
        "Redwood City": 1,
        "San Rafael": 1
    }

    var numStations = Object.keys(stations).length;

    var colors = {
        "sanFrancisco": d3.color("#15B1CC"),
        "oakland": d3.color("#FF7573"),
        "redwoodCity": d3.color("#258899"),
        "sanRafael": d3.color("#CC1567")
    }
    var startingYear = 2010; // default value
    var numYears = 7; 
    var station = "San Francisco Arkansas St"; // default on page load
    
    var offsets = {
        "sanFrancisco": 0,
        "oakland": 1 * numYears,
        "redwoodCity": 2 * numYears,
        "sanRafael": 3 * numYears
    }

    var calculatedIndex, year, yearOffset, stationVisible;

    var national_standard = 35; // ug/m3 (National Ambient Air Quality Standard for PM2.5 daily avg)

    // Get the CSV data
    d3.queue()
        .defer(d3.csv, "/Air Quality Monitoring Data.csv")
        .await(function(error, data) {
            if (error) console.log(error);

            // data is stored as an array of objects
            var allSites = data;

            // convert concentrations to floats
            allSites = allSites.map(function(val) {
                val.Concentration = parseFloat(val.Concentration);
                val.Year = parseFloat(val.Year);
                val.Day = parseFloat(val.Day);
                val.Date = `${val.Month} ${val.Day}`;
                return val;
            });

            // We have an array of objects with keys: 
            // Month, Year, Day, Pollutant, Station, Concentration, Units, AveragingPeriod

            // we want an array of objects with keys:
            //   - Date (ex: "January 1")
            //   - Concs (an array of concentrations on that date each year at each station)
            
            // Make an an array of dates for entire year using 2016 (leap year)
            var arrDates =[];
            allSites.filter(function(val) {
                return val.Station === station && val.Year === 2016;
            }).map(function(val) {
                arrDates.push(val.Date);
            });

            // Make an array of objects with these dates as keys
            var arrObjs = [];
            for(date of arrDates) {
                arrObjs.push({"Date": date, "Concs": []});
            };
            
            // Make an array of concentrations by year for each date and push to arrObjs
            for (var stn in stations) {
                for(var j = 0; j<arrDates.length; j++) {
                    for (var year = 2010; year <= 2016; year++) {
                        for (var i = 0; i<allSites.length; i++) {
                            if (allSites[i].Date === arrDates[j] 
                              && allSites[i].Year === year) {
                                if(allSites[i].Station === stn) {
                                    arrObjs[j].Concs.push(allSites[i].Concentration);
                                }
                            }
                        }
                    }
                }
            }

            // define basic dimensions and scaling
        	var barPadding = 0;
        	var barWidth = (width - 2*padding) / arrObjs.length - barPadding;
            var yMax = d3.max(arrObjs.map(d => d3.max(d.Concs))); 
            var yScale = d3.scaleLinear()
                           .domain([0,yMax])
                           .range([height - padding, padding]); // flipping y axis
            var xScale = d3.scaleTime()
                           .domain([new Date(2016, 0, 1), new Date(2016, 11, 31)]) // 0: January, 11: December
                           .range([padding, width - padding]); 
            var xScaleData = d3.scaleTime()
                           .domain([0, 366]) 
                           .range([padding, width - padding]); 
            var colorScale = d3.scaleLinear()
                   .domain([0,national_standard])
                   .range(['green', 'yellow', 'orange', 'red']);

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
                .attr("transform", `translate(${padding}, 0)`)
                .style('font-family', '"Source Sans Pro",Calibri,Candara,Arial,sans-serif')
                .call(verticalAxis);

            // set up line for NAAQS
            svg.append('path')
                .attr('d', `M${padding} ${yScale(national_standard)} L${width-padding} ${yScale(national_standard)}Z`)
                .attr('fill', 'rgb(0,255,0)')
                .attr('stroke-width','5')
                .attr('stroke','black');

            // set up note about NAAQS
            svg.append('text')
                .attr('x', width/4)
                .attr('y', yScale(national_standard) - padding/2)
                .attr('font-size', "20px")
                .attr('text-anchor','middle')
                .classed('standard', true)
                .html(`Federal ambient air quality standard (35 \u00B5g/m³)`);

            // set up note about Oakland data not being available before 2013
            svg.append('text')
                .attr('x', width/2)
                .attr('y', height/2)
                .attr('font-size', "20px")
                .attr('text-anchor','middle')
                .classed('oakNote', true)
                .html(`No available data for Oakland before 2013`)
                .style('opacity', 0);

            // define defaults on page load (San Francisco 2010)
            stationVisible = d3.select('select')
                    .attr('class').split(" ")[4];
            yearOffset = Number(d3.select('input')
                        .attr('class'));
            year = yearOffset + startingYear;
                    calculatedIndex = offsets[stationVisible] + yearOffset;

            // attach data to rects with class "data", defaulting to SF 2010
            svg.selectAll('rect.data') 
              .data(arrObjs)
              .enter()
              .append('rect')
                .attr('x', (d, i) => xScaleData(i))
                .attr('y', d => yScale(d.Concs[0]) || height - padding) // set NaNs to zero
                .attr('width', barWidth)
                .attr('height', d => height - yScale(d.Concs[0]) - padding || 0) // set NaNs to zero
                .attr('fill', d => colors[stationVisible])
                .classed('data', true)
                .on("mouseenter", function(d) {
                    tooltip.html(`<strong><span style='color:${colors[stationVisible]}'>${d.Date}:</span></strong><br>${d.Concs[calculatedIndex]} \u00B5g/m${"3".sup()}`)
                           .style("opacity", .8)
                           .style("left", d3.event.pageX - d3.select(".tooltip").node().getBoundingClientRect().width/2  + "px")
                           .style("top", d3.event.pageY - 300 + "px" )
                })
                .on("mouseout", function() {
                    tooltip.style("opacity", 0)
                });

            // overwrite default x axis label "2016" with "January"
            d3.select('.tick text')
              .text("January")

            // add slider event listener to choose year to view
            d3.select('input')
              .on('input', function() {
                yearOffset = (d3.event.target.value - d3.event.target.min); 
                year = yearOffset + startingYear;

                d3.select('.year')
                  .text(`Year: ${year}`);
                d3.select('input')
                  .attr('class', yearOffset); // overrides previous class

                stationVisible = d3.select('select')
                    .attr('class').split(" ")[4];
                calculatedIndex = offsets[stationVisible] + yearOffset;

                // change y and height
                t = d3.transition()
                               .duration(700)
                               .ease(d3.easeLinear)

                d3.selectAll("rect.data")
                  .transition(t)
                  .attr('y', d => yScale(d.Concs[calculatedIndex]) || height - padding)
                  .attr('height', d => height - yScale(d.Concs[calculatedIndex]) - padding || 0);

                if (stationVisible == "oakland" && year < 2013) {
                    d3.select('.oakNote')
                       .style('opacity', .8);
                } else {
                    d3.select('.oakNote')
                       .style('opacity', 0);
                }
              })

            // add event listener for button to choose station to show
            d3.select('select')
              .on('change', function() {
                var stationVisible = d3.event.target.options[d3.event.target.selectedIndex].value;
                
                d3.select('select')
                  .attr('class', `selectpicker btn btn-primary btn-lg ${stationVisible}`);

                yearOffset = Number(d3.select('input')
                        .attr('class'));

                year = yearOffset + startingYear;
                calculatedIndex = offsets[stationVisible] + yearOffset;

                t = d3.transition()
                               .duration(2000)
                               .ease(d3.easeCubicOut)

                d3.selectAll("rect.data")
                  .transition(t)
                  .attr('y', d => yScale(d.Concs[calculatedIndex]) || height - padding)
                  .attr('height', d => height - yScale(d.Concs[calculatedIndex]) - padding || 0)
                  .attr('fill', d => colors[stationVisible]);

                if (stationVisible == "oakland" && year < 2013) {
                    d3.select('.oakNote')
                       .style('opacity', .8);
                } else {
                    d3.select('.oakNote')
                       .style('opacity', 0);
                }
                
              })

        });

})