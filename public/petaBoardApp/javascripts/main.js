/*
 * main.js
 *
 * Created by tomonagata on Jun 18, 2016.
 * Copyright (c) 2016 tomonagata. All rights reserved.
 */

function PetaBoardApp(){
    console.log("start PetaBoardApp")
    // 最後に取得された時刻
    var updatedTime
    // 表示するメッセージ
    var fbMessages = []
    // 現在表示しているメッセージの番号
    var num = 0
    // ボードの配列
    var boardArray = new Array()

    // messageのダウンロード
    var request = new MyPostRequest()
    var url = '/api/messages';
    console.log("url:" + url)
    fbMessages = JSON.parse(request.sendGetRequest(url));
    if(fbMessages && fbMessages.length > 0){
        updatedTime = fbMessages[0].updated_time
    }
    console.log("updatedTime:" + updatedTime)

    
    for (var i = 0; i < 4; i++) {
        var board = new petaBoard( document.getElementById( 'container' + i ), {
            itemSelector : '.item',
            transitionDuration : '1.0s',
            isFitWidth : true,
            columnWidth : 250,
        } );
        boardArray.push( board );
    }


    // triggered after new posts have been loaded.
    var tmp = 0;
    function onPostsLoaded( json ) {
        // add posted data to PetaBoard.
        tmp = tmp % 4;
        var boardId = tmp;
        boardArray[boardId].addPost( json );
        tmp = tmp + 1;
    }

    // [for debug] button event.
    var id = 0;
    $('#button').on( 'click', function() {
        console.log("button click - " + "[ " + id +" ]" + fbMessages[id])
        onPostsLoaded( fbMessages[id] );

        id = id + 1;
        if (id > fbMessages.length) {
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
}
