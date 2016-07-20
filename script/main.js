/*
 * main.js
 *
 * Created by tomonagata on Jun 18, 2016.
 * Copyright (c) 2016 tomonagata. All rights reserved.
 */

var jsonFolder = "/Users/tomohiro/Documents/WeddingInstallation_147169992355159";

jQuery( function($)
{
    function init() {
        this.boardArray = new Array();

        for (var i = 0; i < 4; i++) {
            var board = new petaBoard( document.getElementById( 'container' + i ), {
                itemSelector : '.item',
                transitionDuration : '1.0s',
                isFitWidth : true,
                columnWidth : 250,
            } );
            this.boardArray.push( board );
        }
    }

    // triggered after new posts have been loaded.
    var tmp = 0;
    function onPostsLoaded( json ) {
        // add posted data to PetaBoard.
        tmp = tmp % 4;
        var boardId = tmp;
        this.boardArray[boardId].addPost( json );
        tmp = tmp + 1;
    }

    // call the init function first.
    window.addEventListener( 'load', init, false );

    // [for debug] button event.
    var id = 0;
    $('#button').on( 'click', function() {
        var filename = jsonFolder + "/Messages/" + id + ".json";
        var json = loadJson( filename );

        onPostsLoaded( json );

        id = id + 1;
        if (id > 13) {
            id = 0;
        }
    } );

    // [for debug] load json file.
    function loadJson( filename ) {
        var json;

        $.ajaxSetup({ async: false });
        $.get(filename, function(data) {
            if (data == "") {
                return;
            }
            json = $.parseJSON(data)
        }, "text");
        $.ajaxSetup({ async: true });

        return json;
    }
} );
