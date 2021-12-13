const Graph = ForceGraph3D()
(document.getElementById('3d-graph'))
  .jsonUrl('/Big Graph/datasets/dataf.json')

// Nodes
  //.nodeLabel('id') //when on the node shows id
  .nodeLabel(node => `${node.name}: ${node.id}`) //when on the node shows id: country

  .nodeAutoColorBy('occupation')


// Links

  //.linkOpacity(0.5)

  //Arrows + Curve
  .linkDirectionalArrowLength(5)
  .linkDirectionalArrowRelPos(1) //value = 0, arrow close to the source | value = 1, arrow close to the target
  .linkCurvature(0.25)
  
  //Moving particles on links ; speed of moving proportionnal to weight of edge
  .linkDirectionalParticles("value")                  //Nbr of the particles
  .linkDirectionalParticleWidth(d => d.value*0.1)     //Width of the particles
  .linkDirectionalParticleSpeed(d => d.value * 0.001); //Speed of the particles;
