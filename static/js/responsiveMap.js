function resizeMap() {
    /*
      Make the map resposible
     */
    // Margins of the plot inside the container
    var margin = {top: 60, right: 0, bottom: 0, left: 0};
    // Window height less nav-bar height less margin
    var height = $(window).height() - $('.nav').height() -
	         margin.top - margin.bottom;
    // Window width less margin
    var width = $('#mapDiv').width() - margin.right - margin.bottom;
    
    $("#map").height(height);
    $("#map").width(width);
}

$(window).on('orientationchange pageshow resize', function () {
    /*
      When the dimensions of the screen changes, the map is resized 
      to fit correctly on the container div.
     */
    resizeMap();
}).trigger('resize');
