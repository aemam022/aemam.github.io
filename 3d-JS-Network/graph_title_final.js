const graph = ForceGraph3D()

const occupationColor = {
  'Politics':'blue',
  'Cinema':'green',
  'Science' :'purple',
  'Sports':'yellow',
  'Journalism':'orange',
  'Writing and arts':'red',
  'Law':'darkgreen', 
  "Other":'grey',
  "Several":"white",
}


const occupationGroups = {
  'politician' : 'Politics',
  'writer' : 'Writing and arts',
  // cinema
  "actor" : 'Cinema',
  "film producer":"Cinema",
  "cinematographer":"Cinema",
  "film director":"Cinema",
  //science
  'researcher':'Science',
  'epidemiologist':'Science',
  'scientist':'Science',
  'virologist':'Science',
  'university teacher':'Science',
  'physician':'Science',
  //sports
  'football player':"Sports",
  'cricketer':"Sports",
  'American football player':"Sports",
  'association football player':"Sports",
  'basketball player':"Sports",
  'ice hockey player': "Sports",
  "handball player": "Sports",
  "basketball player":"Sports",
  "basketball player":"Sports",
  "rugby league player":"Sports",
  "rugby player":"Sports",
  "athlete":"Sports",
  "coach":"Sports",

  'journalist':'Journalism',

  "lawyer":'Law',
  "judge":'Law',
  "lawyer":'Law',
  "lawyer":'Law',

  
}

const regionColor = {
  "North America" : "orange",
  "China":"red",
  "Continental Europe":"blue",
  'India':'green',
  "UK and Ireland": "pink",
  "Australia and New Zealand":"yellow",
  "Other":'grey',
  "Several":"white"
}

const countryGroups = {
  'United States of America' : 'North America',
  "Canada":'North America',

  "People's Republic of China":'China',
  // continental europe
  'France':'Continental Europe',
  'Italy':'Continental Europe',
  'Germany':'Continental Europe',
  'Spain':'Continental Europe',
  'Greece':'Continental Europe',
  'Norway':'Continental Europe',
  'Kingdom of the Netherlands':'Continental Europe',
  'Poland':'Continental Europe',
  'Finland':'Continental Europe',
  'Switzerland':'Continental Europe',
  'Belgium':'Continental Europe',
  'Russia':'Continental Europe',

  "India": 'India',
  "Dominion of India":'India',
  "British India":"India",
  "United Kingdom": "UK and Ireland",
  "Ireland":"UK and Ireland",

  "Australia":"Qustralia and New Zealand",
  "New Zealand":"Australia and New Zealand",
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
  "Democratic Party":'red',
  "Republican Party": 'blue',
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

const group_property ={
  'occupation':occupationGroups,
  'gender':genderGroups,
  'party': partyGroups,
  'nationality':countryGroups ,
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

graph(document.getElementById('3d-graph'))
  .jsonUrl('output/graph_coquotation_unfiltered_2020_1_filt_10_10.json')
  .nodeColor(n => color_nodes('nationality', n))
  .nodeRelSize(6)

// Nodes
  //.nodeLabel('id') //when on the node shows id
  .nodeLabel(node => `${node.name}:
     ${node.occupation.length  != [] ? node.occupation : 'unknown occupation'}; 
     ${node.nationality.length != [] ? node.nationality: 'unknown country' }`) ;//when on the node shows id: country


// Links
  // .linkLabel(n => n.newssites[0])
  //.linkOpacity(0.5)

  //Arrows + Curve
  // .linkDirectionalArrowLength(5)
  // .linkDirectionalArrowRelPos(1) //value = 0, arrow close to the source | value = 1, arrow close to the target
  // .linkCurvature(0.25)
  
  //Moving particles on links ; speed of moving proportionnal to weight of edge
  // .linkWidth(n => Math.log(n.value))                  //Nbr of the particles
  //.linkDirectionalParticleWidth(d => d.value*0.05)     //Width of the particles
  // .linkDirectionalParticleSpeed(d => d.value * 0.001); //Speed of the particles;

// graph.zoomToFit() // useful ?

//legend

var d3svg = d3.select("#leg").append('svg');
d3svg.attr('width', 1200);
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
  var colormap = color_property[property];
  drawLegend(colormap);
  updateClickable(property);
  graph.nodeColor(n => color_nodes(property, n));
}

updateLegend('nationality');
// svg.attr('class', "dg a");
