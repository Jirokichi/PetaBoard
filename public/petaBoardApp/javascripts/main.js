/*
 * main.js
 *
 * Created by tomonagata on Jun 18, 2016.
 * Copyright (c) 2016 tomonagata. All rights reserved.
 */

function PetaBoardApp(){
    console.log("start PetaBoardApp")

    // 現在表示しているメッセージの番号
    var num = 0
    // ボードの配列
    var boardArray = new Array()

    // メッセージの管理
    var messageManger = new MessageManger()
    
    if(messageManger == null){
        console.log("初期化に失敗")
        return
    }

    // 定期的に新規追加メッセージがないか確認する
    var getDownloadedInterval = setInterval(onDownloaded, 10000);
    console.log("a")
    for (var i = 0; i < 4; i++) {
        var board = new petaBoard( document.getElementById( 'container' + i ), {
            itemSelector : '.item',
            transitionDuration : '1.0s',
            isFitWidth : true,
            columnWidth : 250,
        } );
        boardArray.push( board );
    }

    function onDownloaded(){
        console.log("onDownloaded - " + messageManger.lastUpdatedTime)
        // ページ遷移をしていないかの確認
        var container = document.getElementById('container0')
        if(container == null){
            console.log("container0が行方不明（ページ移動した）のため停止 - onDownloaded")
            clearInterval(getDownloadedInterval)
            return
        }
        messageManger.downloadNewMessages()
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
        
        console.log("button click")
        onPostsLoaded( messageManger.getCurrentMessage() );
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
