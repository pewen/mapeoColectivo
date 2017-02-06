/*
  Create the two difetens map: direct action and citizen map
  depending the url

  Global variables previously declared
  ------------------------------------
  serverUrl: str
    Base url of the server
  layersNames: object
    Names of all the layers
  isDirectActionUrl: bool
    True if the page is direct_action.html
  typemap: str
    Can be "direct_action/" or "citizen_map/"
*/
var map; // Map variable

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
// The style depending is the point is valid or not
function pointToLayer(feature, latlng) {
    if (feature.properties.valido) {
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
    else {
	var validMarker = L.ExtraMarkers.icon({
	    icon: 'fa-check',
	    markerColor: 'red',
	    shape: 'square',
	    prefix: 'fa'
	});

	return L.marker(latlng, {icon: validMarker,});
    }
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

var a;
// Add onclick event
for (name of layersNames) {
    layers[name].on('click', function(e) {
	a = e;
	showPointInfo();
	var properties = e.layer.feature.properties;
	var image_link = serverUrl + "image/" + properties.foto;

	$('#pointImg').attr('src', image_link);
	$('#pointName').text(properties.nombre);
	$('#pointType').text('Tipo: ' + properties.tipo);
	$('#pointDate').text('Fecha reporte: ' +
			     properties.fecha_creacion);
	$('#pointDescription').text(properties.descripcion);

	// If the user is loggin, can validete or delete
	// the points in citizen map
	if (getCookie("status")) {
	    var html = "";
	    var validDiv = document.getElementById("validDeleteButtons");

	    // Validate the point button
	    if (!properties.valido) {
		html += validatePointTemplate.format(properties.tipo,
						     properties.id);
	    }
	    // Delete the point button
	    html += deletPointTemplate.format(properties.tipo,
					      properties.id);
	    validDiv.innerHTML = html;
	}
	
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



// Templates
/* Parameters
  {0}: layer name
  {1}: point id
*/
var deletPointTemplate = `
<button type='button' class='btn btn-danger'
        onClick="deletePoint('{0}', {1})">
    Borrar
</button>`

/* Parameters
  {0}: layer name
  {1}: point id
*/
var validatePointTemplate = `
<button type='button' class='btn btn-info'
        onClick="validatePoint('{0}', {1})">
    Validar
</button>`
