console.log("Read MessageManger file")



jQuery( function($){
    console.log("Read MessageManger class")
    function MessageManger(){
        console.log("start constructor of MessageManger")
        // 全てのメッセージを格納する変数
        this.fbMessages = []
        this.newlyMessages = []
        // 最後に更新した時刻
        this.lastUpdatedTime = null
        // 次に表示する番号の管理
        this.id = 0

        // 初期化
        this.init()
    }



    MessageManger.prototype.init = function(){
         // messageのダウンロード
        this.fbMessages = getAllMessage()
        if(this.fbMessages && this.fbMessages.length > 0){
            this.lastUpdatedTime = fbMessages[0].updated_time
        }
        console.log("this.lastUpdatedTime:" + this.lastUpdatedTime)
    }

    // 表示するメッセージを取得(次の番号への変更も含む)
    MessageManger.prototype.getCurrentMessage = function(){
        if(this.id == null || this.fbMessages == null || this.newlyMessages == null){
            console.log("予期せぬエラー")
            return
        }

        if(this.fbMessages.length < this.id){
            console.log("予期せぬエラー")
            return
        }

        var message
        if(this.newlyMessages.length > 0){
            // 末尾(新しい中でも一番古いもの)取得
            message = this.newlyMessages[this.newlyMessages.length - 1]
            this.fbMessages.unshift(message) // 先頭に追加
            this.id = this.id + 1; // 追加した分プラス
            this.newlyMessages.pop() // 末尾削除
        }else{
            message = this.fbMessages[this.id]
            this.id = this.id + 1;
        }

        if (this.id > this.fbMessages.length) {
            this.id = 0;
        }

        return message
    }

    // 新しいメッセージの取得（）
    MessageManger.prototype.downloadNewMessages = function(){
        if(!this.lastUpdatedTime){
            console.log(" - まーだー")
            return
        }
        var request = new MyPostRequest()
        var url = '/api/messages/' + this.lastUpdatedTime;
        console.log("url:" + url)
        var tmpMessage = JSON.parse(request.sendGetRequest(url));
        console.log(tmpMessage)
        if(tmpMessage.length > 0){
            console.log("追加:" + tmpMessage.length + "件")
            this.lastUpdatedTime = tmpMessage[0].updated_time 
            this.newlyMessages = tmpMessage.concat(this.newlyMessages);
        }else{
            console.log("追加なし")
        }
    }

    // サーバーから全てのメッセージを時刻順に取得する関数（番号の若いものが最新）
    function getAllMessage(){
        console.log("create request")
        var request = new MyPostRequest()
        var url = '/api/messages';
        console.log("url:" + url)
        fbMessages = JSON.parse(request.sendGetRequest(url));
        return fbMessages
    }


     // add to global namespace.
	window.MessageManger = MessageManger;
} );