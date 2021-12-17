const graph = ForceGraph3D()

const occupationColor = {
  'Public life':'blue',
  'Art':'green',
  'Science' :'purple',
  'Sport':'yellow',
  'Journalism':'orange',
  'Business':'red',
  // 'Law':'darkgreen', 
  "Other":'grey',
  "Several":"white",
}



const regionColor = {
  "North_America" : "orange",
  "Asia Pacific":"green",
  "Continental_Europe":"blue",
  "UK_Ireland": "fuchsia",
  "Australia_New_Zealand":"red",
  "Africa Middle East":'teal',
  "Other":'grey',
  "Several":"white"
}


const genderColor = {
  'Male':'orange',
  'Female':'green',
  "Other":'grey',
  // "Several":"grey"
}

const partyGroups = {
  "Democratic Party":'Democratic Party',
  "Republican Party": 'Republican Party',
}
const partyColor = {
  "Democratic Party":'blue',
  "Republican Party": 'red',
}

const genderGroups = {
  'male':'Male',
  'female':'Female'
}

const color_property = {
  'occupation':occupationColor,
  'nationality':regionColor,
  'gender':genderColor,
  'party': partyColor
}


// fill in groups from file
var occupationGroups = {};
var occupationList = ['Art','Business','Journalism','Public life','Science','Sport'];
var promises = [];
for (const cat of occupationList){
  promises.push(d3.text(`/Further_Analysis/groups/liste_${cat}.csv`));
}

Promise.all(promises).then(function(data){
  for (var i=0; i <6 ;i++){
    var parsed = d3.csvParseRows(data[i]); 
    console.log(parsed);

    for (var name of parsed)
      {occupationGroups[name[0]] = occupationList[i];}
  }
})

var regionGroups = {};
var regionList = ["Africa_Middle_East","Asia_Pacific","Australia_New_Zealand","Continental_Europe","North_America","UK_Ireland"];
var promises = [];
for (const cat of regionList){
  promises.push(d3.text(`/Further_Analysis/groups/${cat}.csv`));
}

Promise.all(promises).then(function(data){
  for (var i=0; i <6 ;i++){
    var parsed = d3.csvParseRows(data[i]); 
    console.log(parsed);

    for (var name of parsed)
      {regionGroups[name[0]] = regionList[i];}
  }
})


const group_property ={
  'occupation':occupationGroups,
  'gender':genderGroups,
  'party': partyGroups,
  'nationality':regionGroups ,
}


var ctx ={
  property:null
}


function color_nodes(property, node){
  var colors = color_property[property]; 
  var groups = group_property[property]; 
  var color= colors['Other'];
  for (const x of  node[property]){
    var color2 = colors[groups[x]] ;
    if (x in groups){
      if (color !=  ( colors['Other']  ) && color != color2)
        {color=('Several' in colors ?colors['Several'] : color['Other']);}
      else {color = color2;}
    }
  }
  return color;
}


const properties = ['nationality', 'occupation','gender', 'party']

var graphSim =  graph(document.getElementById('3d-graph'));

function updateViz(){
  var journal = document.querySelector('#journalId').value;
  console.log(journal);
  // d3.select(document.getElementById('3d-graph')).selectChildren().remove();
  graphSim
  .jsonUrl(`/Further Analysis/newssites/graph_coquotation_unfiltered_all_1_filt_10_${journal}.json`)
  .nodeColor(n => color_nodes(ctx.property, n))
  .nodeRelSize(6)
  .nodeLabel(node => `${node.name}:
  ${node.occupation.length  != [] ? node.occupation : 'unknown occupation'}; 
  ${node.nationality.length != [] ? node.nationality: 'unknown country' }`) //when on the node shows id: country
  .refresh();
}


//legend

var d3svg = d3.select("#leg").append('svg');
d3svg.attr('width', 600);
d3svg.attr('height', 200);
d3svg.style('background-color', 'black');
var top_svg = d3svg.append('g');
top_svg.append('g').attr('id','gleg');



// Clickable text to change
var gbutton = top_svg.append('g')
  .attr('id','gbutton')
  .attr('transform',`translate(250,0)`);

gbutton.selectAll('text')
  .data(properties)
  .enter()
  .append('text')
  .attr("transform",(d,i) => `translate(${100*i}, 17)`)
  .attr('fill','white')
  .text (d=> d)
  .on('click', (e,d)=>updateLegend(d))
  ;

function drawLegend(colors){
  var gleg = d3.select('#gleg');
  gleg.selectChildren().remove();
  // make legend
  var blocs = gleg.selectAll('g')
    .data(Object.entries(colors))
    .enter()
    .append('g')
    .attr("transform",(d,i)=> `translate(10, ${30+20*i})`)
    
  blocs.append('text')
    .text(d => d[0])
    .attr('fill', 'white').attr('x',15)
    .attr('y',7);
  blocs.append('circle')  
  .attr('fill', d => d[1])
  .attr('cx', 0)
  .attr('cy', 0)
  .attr('r',7);
  // "legend" at the top
  gleg.append('text')
    .text('Legend :')
    .attr('fill', 'white').attr('x',3)
    .attr('y',17)


}

function updateClickable(property){
  gbutton.selectAll('text')
    .attr('fill',d=> (d==property? 'white':'grey'));
}



function updateLegend(property){
  ctx.property = property;
  var colormap = color_property[property];
  drawLegend(colormap);
  updateClickable(property);
  graph.nodeColor(n => color_nodes(property, n));
}

updateLegend('nationality');
updateViz();

// svg.attr('class', "dg a");
