document.addEventListener("DOMContentLoaded", function() {

	// set the CVG dimensions
	var height = 1500;
	var width = 2000;
    var padding = 60; 

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

    var offsets = {
        "sanFrancisco": 0,
        "oakland": 1 * numStations,
        "redwoodCity": 2 * numStations,
        "sanRafael": 3 * numStations
    }

    var numYears = 4; // GO BACK AND DON'T HARDCODE THIS

    var station = "San Francisco Arkansas St"; // default on page load

    var national_standard = 35; // ug/m3 (National Ambient Air Quality Standard for PM2.5 daily avg)

    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip");

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
                return val;
            });

            // we have an array of objects with keys: 
            // Month, Year, Day, Pollutant, Station, Concentration, Units, AveragingPeriod

            // we want an array of objects with keys:
            // Date (ex: "January 1")
            // Concs (an array of concentrations on January 1 each year)

            // Calculate Date and add it to each object in allSites
            allSites = allSites.map(function(val) {
                val.Date = `${val.Month} ${val.Day}`;
                return val;
            })
            
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
            var index;

            // IS THERE A BETTER WAY TO DO THIS?
            for (var stn in stations) {
                for(var j = 0; j<arrDates.length; j++) {
                    for (var year = 2013; year <= 2016; year++) {
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

            // set up bar charts for San Francisco by default on page load
        	var barPadding = 0;
        	var barWidth = (width - 2*padding) / arrObjs.length - barPadding;
            var yMax = d3.max(arrObjs.map(d => d3.max(d.Concs)));
            var yScale = d3.scaleLinear()
                           .domain([0,yMax])
                           .range([height - padding, padding]); // flipping y axis
            var xScale = d3.scaleTime()
                           .domain([new Date(2016, 0, 1), new Date(2016, 11, 31)]) // 0 January, 11 December
                           .range([padding, width - padding]); 
            var xScaleData = d3.scaleTime()
                           .domain([0, 366]) 
                           .range([padding, width - padding]); 

            var stationVisible = d3.select('select')
                    .attr('class').split(" ")[4];

            var idx = Number(d3.select('input')
                        .attr('class'));

            d3.select('svg')
                .attr('width', width)
                .attr('height', height)
              .selectAll('rect') 
              .data(arrObjs)
              .enter()
              .append('rect')
                .attr('x', (d, i) => xScaleData(i))
                .attr('y', d => yScale(d.Concs[0])) 
                .attr('width', barWidth)
                .attr('height', d => height - yScale(d.Concs[0]) - padding)
                .attr('fill', d => colors[stationVisible])
                .on("mouseenter", function(d) {

                    stationVisible = d3.select('select')
                                       .attr('class').split(" ")[4];

                    idx = Number(d3.select('input')
                                   .attr('class'));

                    tooltip.html(`${d.Date}: ${d.Concs[offsets[stationVisible] + idx]} \u00B5g/m${"3".sup()}`)
                           .style("opacity", 1)
                           .style("left", d3.event.pageX + 20 + "px")
                           .style("top", d3.event.pageY - 60 + "px")
                    // d3.select(d3.event.target).style("fill", colors[stationVisible].darker);
                })
                .on("mouseout", function() {
                    tooltip.style("opacity", 0)
                    // d3.select(d3.event.target).style("fill", colors[stationVisible]);
                });

            // set up line for NAAQS
            d3.select('svg')
              .append('path')
                .attr('d', `M${padding} ${yScale(national_standard)} L${width-padding} ${yScale(national_standard)}Z`)
                .attr('fill', 'rgb(0,255,0)')
                .attr('stroke-width','5')
                .attr('stroke','black')

            // set up axes, accounting for padding
            var verticalAxis = d3.axisLeft(yScale);
            d3.select('svg')
              .append("g")
                .attr("transform", `translate(${padding}, 0)`)
                .call(verticalAxis);

            var horizontalAxis = d3.axisBottom(xScale);
            d3.select('svg')
              .append("g")
                .attr("transform", `translate(0,${height - padding})`)
                .call(horizontalAxis);

            // add slider event listener for each year
            d3.select('input')
              .on('input', function() {
                var idx = (d3.event.target.value - d3.event.target.min); 
                var year = idx + 2013;

                d3.select('.year')
                  .text(`Year: ${year}`);

                d3.select('input')
                  .attr('class', idx); // overrides previous class

                stationVisible = d3.select('select')
                    .attr('class').split(" ")[4];

                // want to change y and height
                d3.selectAll("rect")
                  .attr('y', d => yScale(d.Concs[offsets[stationVisible] + idx]))
                  .attr('height', d => height - yScale(d.Concs[offsets[stationVisible] + idx]) - padding);
              })

            // add event listener for button to choose station to show
            d3.select('select')
              .on('change', function() {
                var stationVisible = d3.event.target.options[d3.event.target.selectedIndex].value;
                
                d3.select('select')
                  .attr('class', `selectpicker btn btn-primary btn-lg ${stationVisible}`);

                idx = Number(d3.select('input')
                        .attr('class'));

                // change color, y, and height
                d3.selectAll("rect")
                  .attr('y', d => yScale(d.Concs[offsets[stationVisible] + idx]))
                  .attr('height', d => height - yScale(d.Concs[offsets[stationVisible] + idx]) - padding)
                  .attr('fill', d => colors[stationVisible]);
              })

        });

})