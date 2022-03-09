function populate_uniprot(){
    document.getElementById('input_uni').value="P31947";
    document.getElementById('input_var').value="226";
}

function populate_uniprot2(){
  document.getElementById('input_uni').value="P09651";
  document.getElementById('input_var').value="10";
}

// 8

function convertJson(myId) {
  var cont = document.getElementById(myId).textContent
  return JSON.parse(cont.replace(/\\/g,'').replace(/^"|"$/g, ''))
}

const cyEdges = convertJson('cyEdges');
const cyNodes = convertJson('cyNodes');
const query_uni = document.getElementById('query_uni').textContent;

var selectedNodeHandler = function(evt) {
  $('#node').show();
  var node = evt.cyTarget.data();
  $("#node").html(`
  <p> Protein: <a href="${node.link}">${node.name}</a></p>
  <p> Uniprot ID: ${node.id} </p>
  <p> Gene ID: ${node.gene} </p>
  <p> Organism: <i>Homo Sapiens</i> </p>
  <p> Residues in interface: ${node.pos}</p>`);
}
var unselectedNodeHandler = function() {
  $('#node').hide();
}
var selectedEdgeHandler = function(evt) {
  $('#edge').show();
  var edge = evt.cyTarget.data();
  if (edge.type != null) {
    $("#edge").html(`
    <p> Interaction: ${edge.source} - ${edge.target} </p>
    <p> Experimental score: ${edge.exp} </p>
    <p> Model/Structure: ${edge.type} </p>
    <p> PDB: <a href="https://www.rcsb.org/structure/${edge.pdb}">${edge.pdb}</a> </p>`);}
  else {
    $("#edge").html(`
    <p> Interaction: ${edge.source} - ${edge.target} </p>
    <p> Experimental score: ${edge.exp} </p>`)
  }
}
var unselectedEdgeHandler = function() {
  $('#edge').hide();
}


Promise.all([
  fetch('/static/m3di/cy-style.json')
  .then(function(res) {
    return res.json()
  })
])
  .then(function(dataArray) {
    var cy = window.cy = cytoscape({
      container: document.getElementById('cy'),
      style: dataArray[0],
      elements: [],
      minZoom: 0.5,
      maxZoom: 2
      });
        
    //Add nodes
    for (var i = 0; i < cyNodes.length; i++) {
        cy.add(
          { data: { id: cyNodes[i].uniprot_id,
                    link: cyNodes[i].protein_link,
                    name: cyNodes[i].protein_name,
                    gene: cyNodes[i].gene_name,
                    pos: cyNodes[i].pos} }
        );
      };
    //Add edges
    for (var i = 0; i < cyEdges.length; i++) {
      cy.add(
        { data: { id: cyEdges[i].p1 + '-' + cyEdges[i].p2, 
          source: cyEdges[i].p1, 
          target: cyEdges[i].p2,
          exp: cyEdges[i].experimental,
          type: cyEdges[i].type,
          pdb: cyEdges[i].PDB_id, 
          self: cyEdges[i].self} }
      );
    };
    cy.layout({
      name: 'cose'
    });

    // select and enlarge query protein node
    cy.nodes('[id="' + query_uni + '"]').style({"width": "70px","height": "70px"})

    cy.on('select','node', selectedNodeHandler)
    cy.on('unselect','node', unselectedNodeHandler)
    cy.on('select','edge', selectedEdgeHandler)
    cy.on('unselect','edge', unselectedEdgeHandler)

    // cy.on('mouseover','node', function(event) {
    //   var node = event.cyTarget;
    //   node.qtip({
    //     content: 'hello',
    //     show: {
    //       event: event.type,
    //       ready: true
    //    },
    //    hide: {
    //       event: 'mouseout unfocus'
    //    }
    //   },event)
    // })

    // cy.on('mouseover','node', selectedNodeHandler)
    // cy.on('mouseout','node', unselectedNodeHandler)
    // cy.on('mouseover','edge', selectededgeHandler)
    // cy.on('mouseout','edge', unselectededgeHandler)

  });

// Display self-interaction checkbox
function displaySelf() {
  checkSelf = document.getElementById("check_self");
  if (checkSelf.checked == true) {
    cy.edges('[?self]').style({'opacity':'1'});
  } else {
    cy.edges('[?self]').style({'opacity':'0'});
  }  
}

// Color proteins involved in interface
function colorPos() {
  checkPos = document.getElementById("check_pos");
  if (checkPos.checked == true) {
    cy.nodes('[?pos]').style({'background-color':'#d96226',"text-outline-color": "#d96226"});
  } else {
    cy.nodes('[?pos]').style({'background-color':'#605C69',"text-outline-color": "#605C69"});
  }  
}



//cc0000, FD333