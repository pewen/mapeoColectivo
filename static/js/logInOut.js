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
    if (isDirectAction) {
	var map = document.getElementById("map");
	var buttonClass = "leaflet-bar easy-button-container leaflet-control";
	var button = map.getElementsByClassName(buttonClass)[0];
    }
    
    if (getCookie("status")) {
	// Is loggin
	loginButton.className = "header-hidden";
	logoutButton.className = "navbar-button";

	if (isDirectAction) {
	    button.className = buttonClass;
	}
    }
    else {
	// Is not login
	loginButton.className = "navbar-button";
	logoutButton.className = "header-hidden";

	if (isDirectAction){
	    button.className = "header-hidden";
	}
    }
}

window.onload = function() {
    logInOut();
};


function logIn() {
    var url = window.location.href;
    var urlSplit = url.split('/');
    var next = urlSplit[urlSplit.length -1 ];

    var logInUrl = "http://127.0.0.1:5000/login?next=" + next;
    window.location = logInUrl;
}


function logOut() {
    var url = window.location.href;
    var urlSplit = url.split('/');
    var next = urlSplit[urlSplit.length -1 ];

    var logOutUrl = "http://127.0.0.1:5000/logout?next=" + next;
    window.location = logOutUrl;
}
