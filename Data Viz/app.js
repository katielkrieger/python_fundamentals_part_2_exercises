document.addEventListener("DOMContentLoaded", function() {

	// set the CVG dimensions
	var height = 900;
	var width = 2000;

    var colors = {
        "San Francisco Arkansas St": "green",
        "Oakland West": "blue",
        "Redwood City": "orange",
        "San Rafael": "purple"
    }

    var station = "San Francisco Arkansas St"; // default 

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
            arrDates =[];
            allSites.filter(function(val) {
                return val.Station === station && val.Year === 2016;
            }).map(function(val) {
                arrDates.push(val.Date);
            });

            // Make an array of objects with these dates as keys
            arrObjs = [];
            for(date of arrDates) {
                arrObjs.push({"Date": date, "Concs": []});
            };
            
            // Make an array of concentrations by year for each date and push to arrObjs
            var index;

            // IS THERE A BETTER WAY TO DO THIS?? SHOULD I HAVE ONE FOR EACH STATION?
            for(var j = 0; j<arrDates.length; j++) {
                for (var year = 2013; year <= 2017; year++) {
                    for (var i = 0; i<allSites.length; i++) {
                        if (allSites[i].Date === arrDates[j] 
                          && allSites[i].Year === year 
                          && allSites[i].Station === station) {
                            arrObjs[j].Concs.push(allSites[i].Concentration);
                        }
                    }
                }
            }

            // set up bar charts
        	var barPadding = 2;
        	var barWidth = width / arrObjs.length - barPadding;
            var yMax = d3.max(arrObjs.map(d => d3.max(d.Concs)))
            var yScale = d3.scaleLinear()
                           .domain([0,yMax])
                           .range([height,0]); // flipping y axis
            var xScale = d3.scaleTime()
                           .domain([new Date(2016, 0, 1), new Date(2016, 11, 31)]) // 0 January, 11 December
                           .range([0,width]); // not working right

            d3.select('svg')
                .attr('width', width)
                .attr('height', height)
              .selectAll('rect') 
              .data(arrObjs)
              .enter()
              .append('rect')
                .attr('x', (d, i) => (barWidth + barPadding) * i)
                .attr('y', d => yScale(d.Concs[0]))
                .attr('width', barWidth)
                .attr('height', d => height - yScale(d.Concs[0]))
                .attr('fill', d => colors[station])

            // set up line for NAAQS
            d3.select('svg')
              .append('path')
                .attr('d', `M0 ${yScale(national_standard)} L2000 ${yScale(national_standard)}Z`)
                .attr('fill', 'rgb(0,255,0)')
                .attr('stroke-width','5')
                .attr('stroke','black')

            // set up axes - NEED TO BUILD IN BUFFERS and then switch to Left and Bottom
            var verticalAxis = d3.axisRight(yScale);
            d3.select('svg')
              .append("g")
                .attr("transform", "translate(0,30)")
                .call(verticalAxis);

            var horizontalAxis = d3.axisTop(xScale);
            d3.select('svg')
              .append("g")
                .attr("transform", `translate(0,${height})`)
                .call(horizontalAxis);

            // add slider event listener for each year
            d3.select('input')
              .on('input', function() {
                var idx = d3.event.target.value - d3.event.target.min; 

                // want to change y and height
                d3.selectAll("rect")
                  .attr('y', d => yScale(d.Concs[idx]))
                  .attr('height', d => height - yScale(d.Concs[idx]))
              })

            // add event listener for button to choose station to show
            d3.select('ul')
              .on('click', function() {
                console.log("fired");
                station = d3.event.target.text;

                // change color, y, and height -- NOTE idx IS NOT DEFINED HERE!
                // NEED TO REMOVE EXISTING DATA AND ATTACH THE RIGHT STATION'S DATA
                d3.selectAll("rect")
                  .attr('y', d => yScale(d.Concs[idx]))
                  .attr('height', d => height - yScale(d.Concs[idx]))
                  .attr('fill', d => colors[station]);
              })

        });

})