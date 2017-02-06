// Get geolocation options
var geoOptions = {
    // Get the best best possible results
    enableHighAccuracy: true,
    // Max time (in milliseconds) to return the position
    // 27 sec
    timeout: 27000,
    // maximum age in milliseconds of a possible cached
    // position that is acceptable to return
    maximumAge: 30000
};


function geoError(error) {
    /*
      Errors on getCurrentPosition()
    */
    var message;
    ee = error;
    switch(error.code) {
    case error.PERMISSION_DENIED:
        message = "El usuario denego usar la Geolocalización."
	break;
    case error.POSITION_UNAVAILABLE:
        message = "La información de posición no esta disponible. Por favor, chequea que tengas el GPS prendido."
	break;
    case error.TIMEOUT:
        message = "Tiempo máximo para encontrar la posición. Por favor, chequea que tengas el GPS prendido."
	break;
    case error.UNKNOWN_ERROR:
        message = "Un error desconocido ocurrio."
	break;
    }
    geoErrorMenssage(message);
}

function geoErrorMenssage(message) {
    /*
      Display the errors when try to get the geo coordinates
     */
    BootstrapDialog.alert(message);
}

function geoSuccess(position) {
    /*
      Sucess on getCurrentPosition()
     */
    var latitude  = position.coords.latitude;
    var longitude = position.coords.longitude;
    var accuracy = position.coords.accuracy;

    //var coordText = document.getElementById('coordinatesInput');
    //coordText.innerHTML = 'Latitud: ' + latitude + ' Longitud : ' + longitude;

    var latSpan = document.getElementById('lat');
    var longSpan = document.getElementById('long');
    latSpan.innerHTML = latitude;
    longSpan.innerHTML = longitude;
    
    $('#newPointModal').modal('show');
}


function geoFindMe() {
    // Check if the browser sopourt geolocation API
    if (!navigator.geolocation){
	var message = "<p>Geolocation is not supported by your browser</p>";
	geoErrorMenssage(message);
	return;
    }

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
}



