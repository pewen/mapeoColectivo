/*
  Create the two difetens map ( direct action and citizen map)
  depenginf the url
*/

var map; // Map variable
var serverUrl = "https://mapeocolectivo-pewen.rhcloud.com/";
// isDirectAction == true if is the directAction url
var actualUrl = window.location.href.indexOf("/accionDirecta");
var isDirectActionUrl = actualUrl > -1;

// Type of map depending of the url
if (isDirectActionUrl) {
    var typeMap = "direct_action/";
}
else {
    var typeMap = "citizen_map/";
}

// Color of each type of point (depending the site)
if (isDirectActionUrl) {
    var layersColors = {
	"actividad artistica": "#a6cee3",
	"arbol": "#33a02c",
	"intervencion publica": "#1f78b4",
	"taller": "#b2df8a"
    }
}
else {
    var layersColors = {
	"agua cloaca": "#fb9a99",
	"arbol peligroso": "#33a02c",
	"bache": "#e31a1c",
	"iluminacion": "#fdbf6f",
	"inundacion": "#ff7f00",
	"micro basural": "#cab2d6",
	"obra inconclusa": "#6a3d9a",
	"otro": "#ffff99"
    }
}

// Object with all the layers
var layers = {};
// URL of the tile
var urlTile = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
// CopyLeft of the map
var mapAtribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';

// Create the map
var map = L.map('map',{
    // disable zoomControl when initializing map
    // (which is topleft by default)
    zoomControl: false
}).setView([-33.12, -64.34], 13);

// Initialice the map
L.tileLayer(urlTile, {
    attribution: mapAtribution,
    maxZoom: 18
}).addTo(map);

// Add zoom control and put on the top right corner
L.control.zoom({
     position:'topright'
}).addTo(map);

// Add button "New point" to the map
L.easyButton( 
    '<span class="star">Agregar Punto</span>',
    function(){ geoFindMe(); },
    {position: 'topright'}
).addTo(map);

// Add the legend to the plot on the bootom right corner
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend')
    // loop through layers names and generate a
    // label with a colored circle for each layer
    for (var color in layersColors) {
        div.innerHTML +=
            '<i style="background:' + layersColors[color] + '"></i> ' +
            '<span>' + color + '</span><br>';
    }
    return div;
};

legend.addTo(map);

// Point style
function pointToLayer(feature, latlng) {
    var style = {
	radius: 8,
	fillColor: layersColors[feature.properties.tipo],
	color: "#000",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
    };
    return L.circleMarker(latlng, style);
}

// Load the data with the personal point style
for (name of layersNames) {
    var dataUrl = serverUrl + typeMap + 'layer/' + name
    layers[name] = new L.GeoJSON.AJAX(dataUrl, {
	pointToLayer: pointToLayer
    });
}

// Add the layer to the map
for (name of layersNames) {
    layers[name].addTo(map);
}

var f;
// Add onclick event
for (name of layersNames) {
    layers[name].on('click', function(e) {
	showPointInfo();
	var properties = e.layer.feature.properties;
	var image_link = serverUrl + "image/" + properties.foto;

	f = properties;

	$('#pointImg').attr('src', image_link);
	$('#pointName').text(properties.nombre);
	$('#pointType').text('Tipo: ' + properties.tipo);
	$('#pointDate').text('Fecha reporte: ' + properties.fecha_creacion);
	$('#pointDescription').text(properties.descripcion);

	// Show the face and twitter only if exist a link
	var face = document.getElementById("faceLink");
	if (properties.face == "") {
	    face.className = "header-hidden";
	}
	else {
	    face.className = "";
	    $('#faceLink').attr('href', properties.face);
	}

	var twitt = document.getElementById("twittLink");
	if (properties.twit == "") {
	    twitt.className = "header-hidden";
	}
	else {
	    twitt.className = "";
	    $('#twittLink').attr('href', properties.twit);
	}
    });
}


function showPointInfo() {
    /*
      Show the extend point info
     */
    var pointInfo = document.getElementById("info");
    var map = document.getElementById("map");

    pointInfo.style.height = map.style.height;
    pointInfo.className = "pointInfo pointInfo-Size";
}

function hidePointInfo() {
    /*
      Hide the point info
     */
    var pointInfo = document.getElementById("info");
    pointInfo.className = "pointInfo header-hidden";
    pointInfo.style.width = "0%";
}
