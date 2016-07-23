/*
common.js

Created by tomonagata on May 16, 2016.
Copyright (c) 2016 tomonagata. All rights reserved.
*/



function changesytle( cssid, cssfile ) {
    document.getElementById( cssid ).href = cssfile;
}




var mt = new MersenneTwister();



function randomInteger(low, high)
{
    // return low + Math.floor(Math.random() * (high - low));
    return mt.nextInt(low, high + 1);
}

function randomFloat(low, high)
{
    // return low + Math.random() * (high - low);
    return low + mt.next() * (high - low);
}

function pixelValue(value)
{
    return value + 'px';
}

function secondValue(value)
{
    return value + 's';
}

// load json file
function loadJson (jsonInfo)
{
    console.log("loadJson:" + jsonInfo.jsonId);
    var json;
    var filename = jsonInfo.jsonFolder + "/Messages/" + jsonInfo.jsonId + ".json";
    var ret = false;

    $.ajaxSetup({ async: false }); // 同期
    $.get(filename, function(data) {
        if (data == "") {
            return;
        }
        // parse json file
        json = $.parseJSON(data)
        ret = true;
    }, "text");
	$.ajaxSetup({ async: true }); // 非同期に戻す

	if (ret == true) {
        jsonInfo.jsonId++;
	}

    return json;
}
