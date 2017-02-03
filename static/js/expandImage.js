function expandImage(title, imgPath) {
    var image = '<img id="largeImage" class="img-responsive" src="{0}">'.format(imgPath);

    BootstrapDialog.show({
	size: BootstrapDialog.SIZE_WIDE,
        title: title,
        message: image,
	buttons: [{
	    label: 'Cerrar',
            action: function(dialogItself){
                dialogItself.close();
	    }
	}],
	onshown: function(dialog) {
	    $('.modal-dialog').css('width', $(window).width() - 50);
	    $('.modal-dialog').css('height', $(window).height() - 50);
	    $('.modal-content').css('width', '100%');
	    $('.modal-content').css('height', '100%');
	    $('.modal-body').css('width', '100%');
	    $('.modal-body').css('height', '80%');
	    $('.bootstrap-dialog-body').css('height', '100%');
	    $('.bootstrap-dialog-message').css('height', '100%');
	    $('#largeImage').css('height', '100%');
	    $('#largeImage').css('margin', 'auto');
	} 
    });
}
