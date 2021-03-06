/*
  Create, validate and delete point summit

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

// Reset the form
$('form').each(function() { this.reset(); });


/*
  Add click listener to upload the photo
*/
var fileSelect = document.getElementById("fileSelect"),
    fileElem = document.getElementById("fileElem");

fileSelect.addEventListener("click", function (e) {
  if (fileElem) {
    fileElem.click();
  }
  e.preventDefault(); // prevent navigation to "#"
}, false);


var file;
function getFile(files) {
    /*
      Get the file upload by the user and check that is a valid file.
    */
    
    // Get a reference to the taken picture or chosen file
    if (files && files.length > 0) {
        file = files[0];
    }

    // File is not an image.
    if (!file.type.match(/image.*/)) {	
	var formErrors = document.getElementById('formErrors');
	formErrors.innerHTML = "Error: el archivo tiene que ser una foto";
	file = '';
    };

    return false
}

var correctName = {
    "Micro basural": "micro_basural",
    "Bache": "bache",
    "Árbol Peligroso": "arbol_peligroso",
    "Iluminación": "ilimunacion",
    "Agua Cloaca": "agua_cloaca",
    "Obra Inconclusa": "obra_inconclusa",
    "Inundación": "inundacion",
    "Otro": "otro",
    "Árbol": "arbol",
    "Actividad Artística": "actividad_artistica",
    "Intervención Pública": "intervencion_publica",
    "Taller": "taller"
}

function newPoint() {
    /*
      Summit a new point to the server
     */
    var title = document.getElementById('titleInput').value;
    var layerName = document.getElementById('typeInput').value;
    var district = document.getElementById('districtInput').value;
    var abstact = document.getElementById('abstractInput').value;

    var latSpan = document.getElementById('lat');
    var longSpan = document.getElementById('long');
    var lat = latSpan.innerHTML;
    var longt = longSpan.innerHTML;
    
    var notFillRequired = (title == "") || (layerName  == "") || (district == "");
    
    if (notFillRequired) {
	var errorDiv = document.getElementById("formErrors");
	errorDiv.innerHTML = "Error, Falta completar campos";

	if (title == "") {
	    var titleInput = document.getElementById('titleInput');
	}
    }

    var jsonRequest = {'titulo': title,
		       'tipo': correctName[layerName],
		       'barrio': district,
		       'resumen': abstact,
		       'latitud': lat,
		       'longitud': longt}

    var formData = new FormData();
    var xhr = new XMLHttpRequest();
    
    formData.append('photo', file);
    var data = new Blob([ JSON.stringify(jsonRequest) ],
			{ type: "application/json" });
    formData.append('data', data);

    // Use the cookies in the post
    xhr.withCredentials = true;
    
    xhr.addEventListener("progress", updateProgress);
    xhr.addEventListener("load", transferComplete);
    xhr.addEventListener("error", transferFailed);

    postUrl = serverUrl + typeMap + "point"
    xhr.open("POST", postUrl);
    xhr.overrideMimeType('multipart/form-data');
    
    xhr.send(formData);

    function updateProgress(evt) {
	var progress = document.getElementById("progressPrcent");
	
	if (evt.lengthComputable) {
	    var percentage = Math.round((evt.loaded * 100) / evt.total);
	    progress.style.width = percentage + "%";
	    progress.innerHTML = percentage + "%";
	}
    }

    function transferFailed(evt) {
	console.log("An error occurred while transferring the file.");
	BootstrapDialog.alert(evt);
    }

    function transferComplete(evt) {
	//$('#newPointModal').modal('hide');

	if (xhr.readyState == 4) {
	    if(xhr.status == 200)
		alert(xhr.responseText);
	    else
		alert(xhr.response);
	}
    }
}


function validatePoint(layerName, pointId) {
    /*
      Validate an existen point
    */
    var request = {'id': pointId,
		   'name': layerName.replace(' ', '_')};
    var data = JSON.stringify(request);
    
    var xhr = new XMLHttpRequest();
    var deleteUrl = serverUrl + typeMap + 'point';

    // Use the cookies in the post
    xhr.withCredentials = true;
    
    xhr.open("PUT", deleteUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}


function deletePoint(layerName, pointId) {
    /*
      Delete a point
    */
    var request = {'id': pointId,
		   'name': layerName.replace(' ', '_')};
    var data = JSON.stringify(request);
    
    var xhr = new XMLHttpRequest();
    var deleteUrl = serverUrl + typeMap + 'point';

    // Use the cookies in the post
    xhr.withCredentials = true;
    
    xhr.open("DELETE", deleteUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}
