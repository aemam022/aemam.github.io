const graph = ForceGraph3D()

const occupationColor = {
  'politician' : 'blue',
  'writer' : 'red',
  // cinema
  "actor" : 'green',
  "film producer":"green",
  "cinematographer":"green",
  "film director":"green",
  //science
  'researcher':'purple',
  'epidemiologist':'purple',
  'scientist':'purple',
  'virologist':'purple',
  'university teacher':'purple',
  'physician':'purple',
  //sports
  'football player':"yellow",
  'cricketer':"yellow",
  'American football player':"yellow",
  'association football player':"yellow",
  'basketball player':"yellow",
  'ice hockey player': "yellow",
  "handball player": "yellow",
  "basketball player":"yellow",
  "basketball player":"yellow",
  "rugby league player":"yellow",
  "rugby player":"yellow",
  "athlete":"yellow",
  "coach":"yellow",

  'journalist':'orange',

  "lawyer":'darkgreen',
  "judge":'darkgreen',
  "lawyer":'darkgreen',
  "lawyer":'darkgreen',

  
}

const countryColor = {
  'United States of America' : 'orange',
  "Canada":'orange',

  "People's Republic of China":'red',
  // continental europe
  'France':'blue',
  'Italy':'blue',
  'Germany':'blue',
  'Spain':'blue',
  'Greece':'blue',
  'Norway':'blue',
  'Kingdom of the Netherlands':'blue',
  'Poland':'blue',
  'Finland':'blue',
  'Switzerland':'blue',
  'Belgium':'blue',
  'Russia':'blue',

  "India": 'green',
  "Dominion of India":'green',
  "British India":"green",
  "United Kingdom": "pink",
  "Ireland":"pink",

  "Australia":"yellow",
  "New Zealand":"yellow",
}

const color_property = {
  'occupation':occupationColor,
  'nationality':countryColor
}

function color_nodes(property, node){
  var color='gray'
  for (const x of  node[property]){
    var color2 = color_property[property][x] ;
    if (x in color_property[property]){
      if (color != 'gray' && color != color2){color='white';}
      else {color = color2;}
    }
  }
  return color;
}

// controls
const controls = { 'DAG Orientation': 'nationality'};
var gui = new dat.GUI();
gui.domElement.id = 'gui';
var menu = gui.add(controls, 'DAG Orientation', ['occupation', 'nationality'])
  .onChange(property =>  graph.nodeColor(n => color_nodes(property, n)));

graph(document.getElementById('3d-graph'))
  .jsonUrl('3d-JS-Network/datasets/graph_coquotation_unfiltered_2020_1_filt_10_10.json')
  .nodeColor(n => color_nodes('nationality', n))
  .nodeRelSize(6)

// Nodes
  //.nodeLabel('id') //when on the node shows id
  .nodeLabel(node => `${node.name}:
     ${node.occupation?node.occupation : 'unknown occupation'}, 
     ${node.nationality[0] == undefined ? 'unknown country' :node.nationality[0]}`) //when on the node shows id: country


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

  