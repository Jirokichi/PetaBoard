
// ****************************************************
// ErrorInfoクラス
// ****************************************************
function ErrorInfo(message){
    this.message = message
}

ErrorInfo.prototype.getJson = function(){
    var tmpJson = {};
    tmpJson.error = this.message;
    return tmpJson;
}
// ****************************************************

module.exports = ErrorInfo