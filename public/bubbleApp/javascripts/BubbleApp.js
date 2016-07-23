/*
.js

Created by tomonagata on May 16, 2016.
Copyright (c) 2016 tomonagata. All rights reserved.
*/

var running = false


jQuery( function($){
    function BubbleApp(){
        var updatedTime

        running = true
        var fbMessages = []
        var num = 0

        console.log("Start BubbleApp");
        var objId = 0;
        var objArray = new Array();

        
        console.log("bubble init")
        var request = new MyPostRequest()
        var url = '/api/messages';
        console.log("url:" + url)
        fbMessages = JSON.parse(request.sendGetRequest(url));
        if(fbMessages && fbMessages.length > 0){
            updatedTime = fbMessages[0].updated_time
        }
        console.log("updatedTime:" + updatedTime)


        var getPostedInterval = setInterval(onPosted, 500);
        var getDownloadedInterval = setInterval(onDownloaded, 10000);
    

        function onDownloaded(){
            console.log("onDownloaded - " + updatedTime)

            // ページ遷移をしていないかの確認
            var container = document.getElementById('bubbleContainer');
            if(container == null){
                console.log("containerが行方不明（ページ移動した）のため停止 - onDownloaded")
                clearInterval(getDownloadedInterval)
                return
            }


            if(!updatedTime){
                console.log(" - まーだー")
                return
            }
                
            var url = '/api/messages/' + updatedTime;
            console.log("url:" + url)
            var tmpMessage = JSON.parse(request.sendGetRequest(url));
            console.log("tmpMessage - " + tmpMessage)
            if(tmpMessage.length > 0){
                updatedTime = tmpMessage[0].updated_time 
                fbMessages.push(tmpMessage)
            }

        }

        function onPosted()
        {
            var container = document.getElementById('bubbleContainer');
            if(container == null){
                console.log("containerが行方不明（ページ移動した）のため停止")
                clearInterval(getPostedInterval)
                return
            }

            
            console.log(fbMessages.length + "/" + num)
            if(fbMessages.length == 0){
                alert("メッセージゼロ")
                return
            }
            var fbMessage = fbMessages[num]
            if (fbMessage.message != "") {
                var bubble = createBubble(fbMessage);
                bubble.setAttribute('id', "objId" + objId);
                objId++;
                container.appendChild(bubble);
                objArray.unshift(bubble);
                $('#' + bubble.id).on('webkitAnimationIteration', onAnimationEnded);
            }
            if (fbMessage.hasPicture) {
                for (var i = 0; i < fbMessage.imageUrls.length; i++) {
                    var photo = createPhoto(fbMessage.imageUrls[i]);
                    photo.setAttribute('id', "objId" + objId);
                    objId++;
                    container.appendChild(photo);
                    objArray.unshift(photo);
                    $('#' + photo.id).on('webkitAnimationIteration', onAnimationEnded);
                }
            }

            if ( (objId > 0) && (objId < 6) ) {
                var obj = objArray.shift();
                obj.classList.toggle("play");
            }

            if(num < fbMessages.length - 1){
                num++
            }else{
                num = 0
            }

        }

        function createBubble(fbMessage)
        {
            var bubble = document.createElement('span');
            var profImg = document.createElement('img');
            var name = document.createTextNode(fbMessage.userName);
            var msg = document.createTextNode(fbMessage.message);

            // setup the elements
            profImg.setAttribute('class', 'bubble');
            profImg.src = fbMessage.userPicture;
            profImg.setAttribute('vspace', '10px');
            profImg.setAttribute('hspace', '10px');

            bubble.setAttribute('class', 'bubble');
            bubble.style.top = "0px";
            bubble.style.opacity = "0";
            bubble.style.left = pixelValue( Math.floor( randomInteger(100, window.innerWidth - 300) / 30 ) * 30 );
            bubble.style.backgroundColor = (mt.next() < 0.3) ? '#ffffe0' : (mt.next() < 0.5) ? '#f0f8ff' : '#99d8ff';

            bubble.style.webkitAnimationName = 'popup';
            bubble.style.webkitAnimationDuration = secondValue(randomFloat(10, 15));
            bubble.style.webkitAnimationDelay = secondValue(randomFloat(0, 5));

            // create a message object.
            bubble.appendChild(profImg);
            bubble.innerHTML += '<br>';
            bubble.appendChild(name);
            bubble.innerHTML += '<br>';
            bubble.appendChild(msg);

            return bubble;
        }

        function createPhoto(imageUrl)
        {
            var photo = document.createElement('img');

            photo.setAttribute('class', 'photo');
            photo.src = imageUrl;

            if (photo.width > photo.height) {
                photo.setAttribute('width', '200px');
                photo.setAttribute('height', 'auto');
            } else {
                photo.setAttribute('height', '200px');
                photo.setAttribute('width', 'auto');
            }
            photo.style.top = "0px";
            photo.style.opacity = "0";
            photo.style.left = pixelValue( Math.floor( randomInteger(100, window.innerWidth - 300) / 30 ) * 30 );

            photo.style.webkitAnimationName = 'popup';
            photo.style.webkitAnimationDuration = secondValue(randomFloat(10, 15));
            photo.style.webkitAnimationDelay = secondValue(randomFloat(0, 5));

            return photo;
        }

        

        function onAnimationEnded()
        {
            this.classList.toggle("play");
            this.style.top = "0px";
            this.style.opacity = "0";
            this.style.left = pixelValue( Math.floor( randomInteger(100, window.innerWidth - 300) / 30 ) * 30 );
            objArray.push(this);

            var obj = objArray.shift();
            obj.classList.toggle("play");
        }

        // Calls the init function first.
        // window.addEventListener('load', init, false);
    }
    // add to global namespace.
	window.BubbleApp = BubbleApp;
} );