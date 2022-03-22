var mapView = new ol.View ({
    //GenSan Coordinates
    // center: ol.proj.fromLonLat([125.172 , 6.113]),
    center: ol.proj.fromLonLat([-73.96511 , 40.77919]),
    zoom: 12
});

var map = new ol.Map ({
    target: 'map',
    view: mapView
});

//Tile Layer

var osmTile = new ol.layer.Tile({
    title: 'Open Street Map',
    visible: true,
    source: new ol.source.OSM()
});

map.addLayer(osmTile);


//Map Layers

var LMManhattan = new ol.layer.Tile({
    title: "Manhattan Landmarks",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/tiger/wms',
        params: {'LAYERS': 'tiger:poly_landmarks', 'TILED' : true},
        serverType: 'geoserver',
        visible: true
    })
})

map.addLayer(LMManhattan);

var RoadManhattan = new ol.layer.Tile({
    title: "Manhattan Roads",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/tiger/wms',
        params: {'LAYERS': 'tiger:tiger_roads', 'TILED' : true},
        serverType: 'geoserver',
        visible: true
    })
})

map.addLayer(RoadManhattan);

var POIManhattan = new ol.layer.Tile({
    title: "Manhattan POI",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/tiger/wms',
        params: {'LAYERS': 'tiger:poi', 'TILED' : true},
        serverType: 'geoserver',
        visible: true
    })
})

map.addLayer(POIManhattan);

var USAStates = new ol.layer.Tile({
    title: "USA States",
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/topp/wms',
        params: {'LAYERS': 'topp:states', 'TILED' : true},
        serverType: 'geoserver',
        visible: true
    })
})

map.addLayer(USAStates);


//Control Layers
// var layerSwitcher = new ol.control.LayerSwitcher({
//     activationMode: 'click',
//     startActive: false,
//     groupSelectStyle:'children'
// });


// map.addControl(layerSwitcher);

function toggleLayer(e) {
    var layerName = e.target.value;
    var checkedStatus = e.target.checked;
    var layerList = map.getLayers();

    layerList.forEach(function(element){
        if (layerName == element.get('title'))
            element.setVisible(checkedStatus)
    });
}

//Display coordinates in map

var mousePosition = new ol.control.MousePosition({
    className: 'mousePosition',
    projection: 'ESPG:4326',
    coordinateFormat: function(coordinate) { return ol.coordinate.format(coordinate, '{y} , {x}', 6 ); }
});

map.addControl(mousePosition);


//Modal

// Get the modal
var modal = document.getElementById("myModal");
// Get the button that opens the modal
var btn = document.getElementById("myBtn");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}