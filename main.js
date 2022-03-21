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


var mousePosition = new ol.control.MousePosition({
    className: 'mousePosition',
    projection: 'ESPG:4326',
    coordinateFormat: function(coordinate) { return ol.coordinate.format(coordinate, '{y} , {x}', 6 ); }
});

map.addControl(mousePosition);

// start: attribute query

var geojson;
var featureOvarlay;

var qryButton = document.createElement('button');
qryButton.innerHTML = '<img src="resources/images/query.png">'
qryButton.className = 'myButton';
qryButton.id = 'qryButton';

var qryElement = document.createElement('div');
qryElement.className = 'myButtonDiv';
qryElement.appendChild(qryButton);

var qryControl = new ol.control.Control ({
    element: qryElement
})

var qryFlag = false;
qryButton.addEventListener("click", () => {
    //disableOtherInteraction('lengthButton');
    qryButton.classList.toggle('clicked');
    qryFlag = !qryFlag;
    document.getElementById("map").style.cursor = "default";
    if (qryFlag) {
        if (geojson){
            geojson.getSource().clear();
            map.removeLayer(geojson);
        }

        if (featureOvarlay) {
            featureOvarlay.getSource().clear();
            map.removeLayer(featureOvarlay);
        }
        document.getElementById("attyQueryDiv").style.display = "block";

        bolIdentify = false;

        addMapLayerList();
    } else {
        document.getElementById("attyQueryDiv").style.display = "none";
        document.getElementById("attListDiv").style.display = "none";

        if (geojson) {
            geojson.getSource().clear();
            map.removeLayer(geojson);
        }

        if (featureOvarlay) {
            featureOvarlay.getSource().clear();
            map.removeLayer(featureOvarlay);
        }
    }
})

map.addControl(qryControl);

function addMapLayerList() {
    $(document).ready(function () {
        $.ajax ({
            type: "GET",
            url: "http://localhost:8080/geoserver/wfs?request=getCapabilities",
            datatype: "xml",
            success: function (xml) {
                var select = $('#selectLayer');
                select.append("<option class='ddindent' value=''></option>");
                $(xml).find('FeatureType').each(function () {
                    $(this).find('Name').each(function () {
                        var value = $(this).text();
                        select.append("<option class='ddindent' value='"+ value + "'>" + value + "</option>");
                    });
                });
            }
        });
    });
};

$(function () {
    document.getElementById("selectLayer").onchange = function () {
        var select = document.getElementById("selectAttribute");
        while (select.options.length > 0) {
            select.remove(0);
        }
        var value_layer = $(this).val();
        $(document).ready(function () {
            $.ajax({
                type: "GET",
                url: "http://localhost:8080/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typeName=" + value_layer,
                dataType: "xml",
                success: function (xml) {

                    var select = $('#selectAttribute');
                    //var title = $(xml).find('xsd\\:complexType').attrt('name');
                    //alert (title);
                    select.append("<option class='ddindent' value=''></option>");
                    $(xml).find('xsd\\:sequence').each(function () {

                        $(this).find('xsd\\:element').each(function () {
                            var value = $(this).attr('name');
                            //alert(value);
                            var type = $(this).attr('type');
                            //alert(type);
                            if (value != 'geom' && value != 'the_geom') {
                                select.append ("<option class='ddindent' value='"+ value + "'>" + value + "</option>");
                            }
                        });
                    });

                }
            });
        });
    }
    document.getElementById("selectAttribute").onchange = function () {
        var operator = document.getElementById("selectorOperator");
        while (operator.options.length > 0) {
            operator.remove(0);
        }
        
        var value_type = $(this).val();
        //alert(value_type);
        var value_attribute = $('#selectAttribute option:selected').text();
        operator.options[0] = new Option('Select operator', "");

        if (value_type == 'xsd:short' || value_type == 'xsd:int' || value_type == 'xsd:double' ) {
            var operator1 = document.getElementById("selectOperator");
            operator1.options[1] = new Option('Greater than', '>');
            operator1.options[2] = new Option('Less than', '<');
            operator1.options[3] = new Option('Equal to', '=');
        }
        else if (value_type == 'xsd:string') {
            var operator1 = document.getElementById("selectOperator");
            operator1.options[1] = new Option('Like', 'Like');
            operator1.options[2] = new Option('Equal to', '=');
        }
    }

    document.getElementById('attQryRun').onclick = function () {
        map.set("isLoading", 'YES');

        if (featureOvarlay) {
            featureOvarlay.getSource().clear();
            map.removeLayer(featureOvarlay);
        }

        var layer =  document.getElementById("selectLayer");
        var attribute = document.getElementById("selectAttribute");
        var operator = document.getElementById("selectOperator");
        var txt = document.getElementById("enterValue");

        if (layer.options.selectedIndex == 0) {
            alert("Select layer");
        } else if (attribute.options.selectedIndex == -1) {
            alert("Select Attribute");
        } else if (operator.options.selectedIndex <= 0) {
            alert("Select Operator");
        } else if (txt.value.length <= 0) {
            alert ("Enter Value");
        } else {
            var value_layer = layer.options[layer.selectedIndex].value;
            var value_attribute = attribute.options[attribute.selectedIndex].text;
            var value_operator = operator.options[operator.selectedIndex].value;
            var value_txt = txt.value;
            if (value_operator == 'Like') {
                value_txt = "%25" + value_txt + "%25";
            }
            else {
                value_txt = value_txt;
            }
            var url = "https://localhost:8080/geoserver/GISSimplified/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + value_layer + "&CQL_FILTER" + value_attribute + "+" + value_operator + "+'" + value_txt + "'&outputFormat=application/json"
            //console.log(url);
            newaddGeoJsonToMap(url);
            newPopulateQueryTable(url);
            settimeout(function () { newaddRowHandlers(url); }, 300);
            map.set("isLoading", 'NO');
        }
    }
});
// end: attribute query