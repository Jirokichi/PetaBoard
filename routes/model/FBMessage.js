var log4js = require('log4js');
var logger = log4js.getLogger();

// ****************************************************
// FBMessageクラス
// ****************************************************
function FBMessage(jsonMessageReturnedFromFB){
    var id = jsonMessageReturnedFromFB.id
	var message = jsonMessageReturnedFromFB.message
	var updated_time = jsonMessageReturnedFromFB.updated_time
	var hasPicture = (jsonMessageReturnedFromFB.picture == null ? false : true )
	
	var userId
	var userName
	var userPicture
	if(jsonMessageReturnedFromFB.from){
		var from = jsonMessageReturnedFromFB.from
		userId = from.id
		userName = from.name
		if(from.picture){
			if(from.picture.data){
				userPicture = from.picture.data.url
			}
		}
	}

	this.id = id
	this.message = message
	this.updated_time = Date.parse( updated_time )
	this.hasPicture = hasPicture
	this.userId = userId
	this.userName = userName
	this.userPicture = userPicture
}
FBMessage.prototype.log = function(){
    logger.debug("(id, message, updated_time, hasPicture)" + "("+ this.id +", " + this.message + ", " + this.updated_time + ", " + this.hasPicture +")");
    logger.debug("(userId, userName, userPicture)" + "("+ this.userId +", " + this.userName + ", " + this.userPicture +")");
}
// ****************************************************

module.exports = FBMessage