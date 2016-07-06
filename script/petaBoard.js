/*
 * petaBoard.js
 *
 * Created by tomonagata on Jun 18, 2016.
 * Copyright (c) 2016 tomonagata. All rights reserved.
 */

 jQuery( function($)
 {
    function petaBoard( container, options ) {
		this.container = container;
		this.options = extend( this.defaults, options );
		this.init();
	}

	petaBoard.prototype = {
		defaults : {
            itemSelector : '.item',
            transitionDuration : '0.4s',
            isFitWidth : true,
            columnWidth : 340,
		},
		init : function() {
            var self = this;
			imagesLoaded( this.container, function() {

				self.masonry = new Masonry( self.container, {
					itemSelector : self.options.itemSelector,
					transitionDuration : self.options.transitionDuration,
                    isFitWidth : self.options.isFitWidth,
                    columnWidth : self.options.columnWidth
				} );
			});
		},
        addPost : function( data ) {
            var self = this;
            elements = createItemElement( data );
            $(this.container).prepend( $(elements) );
            // imagesLoaded( this.container, function() {
                self.masonry.prepended( elements );
            // });
		},
	}

    function createItemElement( json ) {
        // create item
        var item = document.createElement( 'div' );
        var rand = Math.random();
        item.setAttribute( 'class', 'item' );

        // add photos to item
        for (var j = 0; j < json.pictures.length; j++) {
            var photo = document.createElement( 'img' );
            photo.src = jsonFolder + '/Images/' + json.pictures[j];
            item.appendChild( photo );
        }

        // create message box
        var msgBox = document.createElement( 'div' );
        msgBox.setAttribute( 'class', 'msgBox' );

        // add profile photo to message box
        var profPhoto = document.createElement( 'div' );
        profPhoto.setAttribute( 'class', 'profPhoto' );
        img = document.createElement( 'img' );
        img.src = json.userImageUrl;
        profPhoto.appendChild( img );
        msgBox.appendChild( profPhoto );

        // add user name to message box
        var name = document.createElement('div');
        name.setAttribute('class', 'name');
        name.innerHTML += '<p>' + json.userName + '</p>';
        msgBox.appendChild( name );

        // add message to message box
        msgBox.innerHTML += '<p>' + json.message + '</p>';

        // add message box to item
        item.appendChild( msgBox );

        // add item to container
        // var container = document.getElementById( 'container' );
        // container.appendChild( item );

        return item;
    };

	function extend( a, b ) {
		for (var key in b) {
			if (b.hasOwnProperty( key )) {
				a[key] = b[key];
			}
		}
		return a;
	}

	// add to global namespace.
	window.petaBoard = petaBoard;

} );
