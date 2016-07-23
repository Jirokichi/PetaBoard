/*
 * MyRequest.js
 *
 * Created by Yuya Kida on July 16, 2016.
 * Copyright (c) 2016 yuyakida. All rights reserved.
 */

jQuery( function($){
    console.log("start MyPostRequest")
    function MyPostRequest(){
        console.log("start constructor of MyPostRequest")
    }

    MyPostRequest.prototype = {
        sendGetRequest : function( url ) {
            var self = this;
            req = new XMLHttpRequest();
            req.open("GET", url, false);
            setParameters(req);
            req.send(null);
            return req.responseText;
        }
    }


    function setParameters(req) {
        req.setRequestHeader('Content-Type', 'application/json');
        return req;
    }

    // add to global namespace.
	window.MyPostRequest = MyPostRequest;

} );