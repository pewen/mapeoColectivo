function logInOut(){
    /*
      Check if the user is login or not
    */
    // Button on the nav-bar
    var loginButton = document.getElementById("loginButton");
    var logoutButton =  document.getElementById("logoutButton");

    // Check if is the correct page
    var isDirectAction = window.location.href.indexOf("/accionDirecta") > -1;

    // Button to add new point
    var map = document.getElementById("map");
    var buttonClass = "leaflet-bar easy-button-container leaflet-control";
    var button = map.getElementsByClassName(buttonClass)[0];
    
    if (getCookie("status")) {
	// Is loggin
	loginButton.className = "header-hidden";
	logoutButton.className = "";

	if (isDirectAction) {
	    button.className = buttonClass;
	}
    }
    else {
	// Is not login
	loginButton.className = "";
	logoutButton.className = "header-hidden";

	if (isDirectAction){
	    button.className = "header-hidden";
	}
    }
}

window.onload = function() {
    logInOut();
};
