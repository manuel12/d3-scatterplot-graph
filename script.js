const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const margin = {
  top: 100,
  right: 20,
  bottom: 30,
  left: 60,
};

const width = 920 - margin.left - margin.right;
const height = 630 - margin.top - margin.bottom;

const xScaleFunc = d3.scaleLinear().range([0, width]);
const yScaleFunc = d3.scaleTime().range([0, height]);

const xAxis = d3.axisBottom(xScaleFunc).tickFormat((d) => d);
const yAxis = d3.axisLeft(yScaleFunc).tickFormat(d3.timeFormat("%M:%S"));

// Create svg
const svg = d3
  .select(".container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("class", "graph")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top / 2 + ")");

// Create tooltip
const tooltip = d3
  .select(".container")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

d3.json(url).then((data) => {
  console.log(data);
  data.forEach((d) => {
    const currentTime = d.Time;
    const minutesSeconds = currentTime.split(":");
    const dateObj = new Date(
      1970,
      0,
      1,
      0,
      minutesSeconds[0],
      minutesSeconds[1]
    );
    d.Time = dateObj;
  });

  xScaleFunc.domain([
    d3.min(data, (d) => d.Year - 1),
    d3.max(data, (d) => d.Year + 1),
  ]);

  yScaleFunc.domain(d3.extent(data, (d) => d.Time));

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g").attr("id", "y-axis").call(yAxis);

  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 6)
    .attr("cx", (d) => {
      return xScaleFunc(d.Year);
    })
    .attr("cy", (d) => {
      return yScaleFunc(d.Time);
    })
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time.toISOString())
    .style("fill", (d) => {
      return d.Doping ? "orange" : "lightgreen";
    })

    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 0.9)
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px")
        .attr("data-year", d.Year);

      tooltip.html(
        d.Name +
          ", " +
          d.Nationality +
          "<br>" +
          "Time: " +
          d3.timeFormat("%M:%S")(d.Time) +
          "<br>" +
          "Place: " +
          d.Place +
          "<br>" +
          "Year: " +
          d.Year +
          "<br>" +
          "Doping: " +
          `${d.Doping ? d.Doping : "none"}.`
      );
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  const legendContainer = svg.append("g").attr("id", "legend");
  const noDopingLegend = legendContainer
    .append("g")
    .attr("class", "legend-label");
  noDopingLegend
    .append("rect")
    .attr("x", width - 20)
    .attr("y", height / 2 + 50)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "lightgreen");

  noDopingLegend
    .append("text")
    .attr("x", width - 160)
    .attr("y", height / 2 + 62)
    .text("No doping allegations")
    .style("font-size", "0.8rem");

  const dopingLegend = legendContainer
    .append("g")
    .attr("class", "legend-label");
  dopingLegend
    .append("rect")
    .attr("x", width - 20)
    .attr("y", height / 2 + 25)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "orange");

  dopingLegend
    .append("text")
    .attr("x", width - 210)
    .attr("y", height / 2 + 40)
    .text("Riders with doping allegations")
    .style("font-size", "0.8rem");
});
