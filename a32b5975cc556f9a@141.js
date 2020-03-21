
export default function define(runtime, observer) {
  const main = runtime.module();
  
  const fileAttachments = new Map(
    [["life.txt",new URL("https://anton-eris-zheltoukhov.github.io/reflections/life.txt",import.meta.url)]]
  );
  
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  
  main.variable(observer("showLength")).define("showLength", ["Generators", "viewof showLength"], (G, _) => G.input(_));

  main.variable(observer("chart")).define("chart", ["d3","data","cluster","setRadius","innerRadius","maxLength","setColor","outerRadius","width","legend","linkExtensionConstant","linkConstant","linkExtensionVariable","linkVariable"], function(d3,data,cluster,setRadius,innerRadius,maxLength,setColor,outerRadius,width,legend,linkExtensionConstant,linkConstant,linkExtensionVariable,linkVariable)
  {
  const root = d3.hierarchy(data, d => d.branchset)
      .sum(d => d.branchset ? 0 : 1)
      .sort((a, b) => (a.value - b.value) || d3.ascending(a.data.length, b.data.length));

  cluster(root);
  setRadius(root, root.data.length = 0, innerRadius / maxLength(root));
  setColor(root);

  const svg = d3.create("svg")
      .attr("viewBox", [-outerRadius, -outerRadius, width, width])
      .classed('viewBox',true)
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);
      

  svg.append("g")
      .call(legend);

  svg.append("style").text(`

  .link--active {
  stroke: #000 !important;
  stroke-width: 1.5px;
  }

  .link-extension--active {
  stroke-opacity: .6;
  }

  .label--active {
  font-weight: bold;
  }

  `);

  const linkExtension = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.25)
    .selectAll("path")
    .data(root.links().filter(d => !d.target.children))
    .join("path")
      .each(function(d) { d.target.linkExtensionNode = this; })
      .attr("d", linkExtensionConstant);

  const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
    .selectAll("path")
    .data(root.links())
    .join("path")
      .each(function(d) { d.target.linkNode = this; })
      .attr("d", linkConstant)
      .attr("stroke", d => d.target.color);

  svg.append("g")
    .selectAll("text")
    .data(root.leaves())
    .join("text")
      .attr("dy", ".31em")
      .attr("transform", d => `rotate(${d.x - 90}) translate(${innerRadius + 4},0)`) //translate(${innerRadius + 4},0)${d.x < 180 ? "" : " rotate(180)"}
      .attr("text-anchor", d => d.x < 180 ? "start" : "start") //d => d.x < 180 ? "start" : "end"
      .text(d => d.data.name.replace(/_/g, " "))
      .on("mouseover", mouseovered(true))
      .on("mouseout", mouseovered(false))
      .on("click", clicked());

  function clicked() {
    let rotated_times = 1;
    let shift = 0;

    return function() {
      if (!shift) {
        let viewBox = document.getElementsByClassName("viewBox")[0]
        let currentViewBoxCoords = viewBox.getAttribute("viewBox")
        let coordsArray = currentViewBoxCoords.split(',');
        shift = coordsArray[0] * 0.5;
      }
      
      let shiftDirection = rotated_times % 2 ? 1 : -1;
      let transform = parseTransform(this.getAttribute("transform"))

      d3.select(".viewBox")
      // .transition()
      // .duration(1500)
      // .attr('transform' , 'rotate(' + -transform.rotate + ', 0, 0)')
      .transition()
      .duration(500)
      .attr('transform' , 'translate(' + shiftDirection * shift + ', 0)');

      rotated_times += 1

      let contents = document.getElementById("contents")
          contents.appendChild(document.createTextNode("This is new."))
    }
  }

  function parseTransform(a)
  {
    var b={};
    for (var i in a = a.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?)+\))+/g))
    {
        var c = a[i].match(/[\w\.\-]+/g);
        b[c.shift()] = c;
    }
    return b;
  }

  function update(checked) {
    const t = d3.transition().duration(750);
    linkExtension.transition(t).attr("d", checked ? linkExtensionVariable : linkExtensionConstant);
    link.transition(t).attr("d", checked ? linkVariable : linkConstant);
  }

  function mouseovered(active) {
    return function(d) {
      d3.select(this).classed("label--active", active);
      d3.select(d.linkExtensionNode).classed("link-extension--active", active).raise();
      do d3.select(d.linkNode).classed("link--active", active).raise();
      while (d = d.parent);
    };
  }

  return Object.assign(svg.node(), {update});
  }
  );
  main.variable(observer()).define(["chart","showLength"], function(chart,showLength){return(
  chart.update(showLength)
  )});

  main.variable(observer("viewof showLength")).define("viewof showLength", ["html"], function(html)
  {
    const form = html`<form style="font: 12px var(--sans-serif); display: flex; flex-direction: column; justify-content: center; min-height: 33px;"><label style="display: flex; align-items: center;"><input type=checkbox name=i><span style="margin-left: 0.5em;">Show branch length</span>`;
    const timeout = setTimeout(() => {
      form.i.checked = true;
      form.i.onclick();
    }, 2000);
    form.i.onclick = () => {
      clearTimeout(timeout);
      form.value = form.i.checked;
      form.dispatchEvent(new CustomEvent("input"));
    };
    form.value = false;
    return form;
  });

  main.variable(observer("cluster")).define("cluster", ["d3","innerRadius"], function(d3,innerRadius){return(
  d3.cluster()
    .size([360, innerRadius])
    .separation((a, b) => 1)
  )});
  main.variable(observer("color")).define("color", ["d3"], function(d3){return(
    d3.scaleOrdinal()
      .domain(["Bacteria", "Eukaryota", "Archaea"])
      .range(d3.schemeCategory10)
  )});
  main.variable(observer("maxLength")).define("maxLength", ["d3"], function(d3){return(
  function maxLength(d) {
  return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
  }
  )});
  main.variable(observer("setRadius")).define("setRadius", function(){return(
  function setRadius(d, y0, k) {
  d.radius = (y0 += d.data.length) * k;
  if (d.children) d.children.forEach(d => setRadius(d, y0, k));
  }
  )});
  main.variable(observer("setColor")).define("setColor", ["color"], function(color){return(
  function setColor(d) {
  var name = d.data.name;
  d.color = color.domain().indexOf(name) >= 0 ? color(name) : d.parent ? d.parent.color : null;
  if (d.children) d.children.forEach(setColor);
  }
  )});
  main.variable(observer("linkVariable")).define("linkVariable", ["linkStep"], function(linkStep){return(
  function linkVariable(d) {
  return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
  }
  )});
  main.variable(observer("linkConstant")).define("linkConstant", ["linkStep"], function(linkStep){return(
  function linkConstant(d) {
  return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
  }
  )});
  main.variable(observer("linkExtensionVariable")).define("linkExtensionVariable", ["linkStep","innerRadius"], function(linkStep,innerRadius){return(
  function linkExtensionVariable(d) {
  return linkStep(d.target.x, d.target.radius, d.target.x, innerRadius);
  }
  )});
  main.variable(observer("linkExtensionConstant")).define("linkExtensionConstant", ["linkStep","innerRadius"], function(linkStep,innerRadius){return(
  function linkExtensionConstant(d) {
  return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
  }
  )});
  main.variable(observer("linkStep")).define("linkStep", function(){return(
  function linkStep(startAngle, startRadius, endAngle, endRadius) {
  const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI);
  const s0 = Math.sin(startAngle);
  const c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI);
  const s1 = Math.sin(endAngle);
  return "M" + startRadius * c0 + "," + startRadius * s0
      + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
      + "L" + endRadius * c1 + "," + endRadius * s1;
  }
  )});
  main.variable(observer("legend")).define("legend", ["color","outerRadius"], function(color,outerRadius){return(
  svg => {
  const g = svg
    .selectAll("g")
  //   .data(color.domain())
  //   .join("g")
  //     .attr("transform", (d, i) => `translate(${-outerRadius},${-outerRadius + i * 20})`);

  // g.append("rect")
  //     .attr("width", 18)
  //     .attr("height", 18)
  //     .attr("fill", color);

  // g.append("text")
  //     .attr("x", 24)
  //     .attr("y", 9)
  //     .attr("dy", "0.35em")
  //     .text(d => d);
  }
  )});
  main.variable(observer("data")).define("data", ["parseNewick","FileAttachment"], async function(parseNewick,FileAttachment){return(
  parseNewick(await FileAttachment("life.txt").text())
  )});
  main.variable(observer("width")).define("width", function(){return(
  954
  )});
  main.variable(observer("outerRadius")).define("outerRadius", ["width"], function(width){return(
  width / 2
  )});
  main.variable(observer("innerRadius")).define("innerRadius", ["outerRadius"], function(outerRadius){return(
  outerRadius - 170
  )});
  main.variable(observer("parseNewick")).define("parseNewick", function(){return(
  function parseNewick(a){for(var e=[],r={},s=a.split(/\s*(;|\(|\)|,|:)\s*/),t=0;t<s.length;t++){var n=s[t];switch(n){case"(":var c={};r.branchset=[c],e.push(r),r=c;break;case",":var c={};e[e.length-1].branchset.push(c),r=c;break;case")":r=e.pop();break;case":":break;default:var h=s[t-1];")"==h||"("==h||","==h?r.name=n:":"==h&&(r.length=parseFloat(n))}}return r}
  )});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
  require("d3@5")
  )});
  return main;
}
