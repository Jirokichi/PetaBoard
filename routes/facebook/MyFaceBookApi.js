
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.info('@MyFaceBookApi');

function MyFaceBookApi () {}


var config = require('../api/config');
var DB_PATH = config.DB_PATH;
var monk = require('monk'); // not object but method
var db = monk(DB_PATH);
const TABLE_NAME_MESSAGES = 'Messages';
const TABLE_NAME_SETTINGS = 'Settings';
var Client = require('node-rest-client').Client;
var FBMessage = require("../model/FBMessage")
/**
 * @type {Int} 繰り返し回数
 */
var count = 0


var accessToken = ""

/**
* MyFaceBookApiのコンストラクタ
* @param {Int} waitInterval 通信ごとのインターバル(10000以上を推奨)
*/
function MyFaceBookApi(waitInterval){
	this.waitInterval = waitInterval
}

/**
* MyFaceBookApiの関数。グループメッセージの同期が開始される。途中で停止したい場合は、cancelSyncを呼ぶ。
* 途中停止はしないが、一度メッセージの取得が終了したタイミングで同期が解除される。
* @param {String} lAccessToken アクセストークン
* @param {String} groupId グループID
*/
MyFaceBookApi.prototype.startSyncForGroupMessage = function(lAccessToken, groupId){
	this.cancel = false

	var settingInfo = getSettingInfo(function(runningSync, accessToken, groupId){
		syncForGroupMessage(runningSync, accessToken, groupId)
	})
}

/**
* MyFaceBookApiの関数。グループメッセージの同期キャンセルする。
* 途中停止はしないが、一度メッセージの取得が終了したタイミングで同期が解除される。
*/
MyFaceBookApi.prototype.cancelSync = function(){
	this.cancel = true
};

/**
* MyFaceBookApiの関数。AccessTokenの有効性を確認する。
* @param {String} accessToken アクセストークン
* @param {MyFaceBookApi~callBackForMeApi} callBackForMeApi コールバック関数
*/
MyFaceBookApi.prototype.checkAccessTokenIsActiveOrNot = function(accessToken, callBackForMeApi){
	logger.info("checkAccessTokenIsActiveOrNot start")

	//https://github.com/aacerox/node-rest-client
	var Client = require('node-rest-client').Client;

	var client = new Client();

	var url = "https://graph.facebook.com/v2.6/me?access_token=" + accessToken;
	// direct way
	var req = client.get(url, function (data, response) {
		// parsed response body as js object
		var jsonData = JSON.parse(data);
		logger.debug(jsonData);
		callBackForMeApi(jsonData)
	});

	req.once('error', function(error){
		logger.error('request error in checkAccessTokenIsActiveOrNot')
		callBackForMeApi()
	});
};

/**
 * me APIの通信結果を返す。エラーの場合も返すように実装されている(引数はnull)
 * @callback MyFaceBookApi~callBackForMeApi
 * @param {Object} jsonData - me APIの返り値( JSON に相当する Object )
 */



/**
 * MyFaceBookApiの関数。AccessTokenの有効性を確認する。
 * @param {String} accessToken: アクセストークン
 * @param {Callback1} callBack: コールバック関数
 */
MyFaceBookApi.prototype.getGroups = function(accessToken, callBack){
	logger.info("getGroups start")

	//https://github.com/aacerox/node-rest-client
	var Client = require('node-rest-client').Client;

	var client = new Client();

	var url = "https://graph.facebook.com/v2.6/me/groups?"
	var param = "";
	param = param + "access_token=" + accessToken;
	parame = param + "&" + "fields=" + "data,name,id,owner,privacy";
	client.get(url + param, function (data, response) {
		var jsonData = JSON.parse(data);
		logger.debug("jsonData in getGroups:" + JSON.stringify(jsonData));
		callBack(jsonData)
	});
	
}



//*************************************
// * Privateな関数
// *************************************

/**
 * メッセージの同期関数。
 * @param {String} accessToken アクセストークン
 * @param {String} groupId 取得するグループID
 */
function syncForGroupMessage(runningSync, lAccessToken, groupId){
	
	// 同期中でなければ10秒まって再度呼び出す
	if(!runningSync){
		logger.info("同期中でないため待機中(" + runningSync + ")" + "..." + 
		"(" + groupId +")")
		setTimeout(function(){

				var settingInfo = getSettingInfo(function(runningSync, accessToken, groupId){
					syncForGroupMessage(runningSync, accessToken, groupId)
				})

		 	 	
			}, 10000)
		return
	}
	
	
	
	logger.debug("*******************************************************************")
	logger.debug("syncForGroupMessage for groupId = " + groupId + "(" + count + ")")
	logger.debug("*******************************************************************")
	var url = "https://graph.facebook.com/v2.6/" + groupId + "/feed?"
	var param = "";
	param = param + "access_token=" + lAccessToken;
	param = param + "&" + "fields=" + "message,updated_time,id,picture,from{id,name,picture}";
	url = url + param
	
	callApi(url, didDownloadedMessage, function(){
		count += 1 
		if(!this.cancel){
			setTimeout(function(){
				// generateHeapDumpAndStats()
		 	 	var settingInfo = getSettingInfo(function(runningSync, accessToken, groupId){
					syncForGroupMessage(runningSync, accessToken, groupId)
				})
			}, this.waitInterval)
		}
	})
}


function getSettingInfo(callBack){
	var collection = db.get(TABLE_NAME_SETTINGS);
	collection.find({}, function(err, records){
	    		if (err) {
					logger.debug(err)
					callBack(false, "", "")
					return
				}
				if(records.length != 1){
					logger.debug("records.length(" + records.length + ")が不適切")
					callBack(false, "", "")
					return
				}
				
				var record = records[0]

				accessToken = record.accessToken
				callBack(record.runingSync, record.accessToken, record.selectedGroupId)
	})
}

// require('heapdump');
// function generateHeapDumpAndStats(){
//   //1. Force garbage collection every time this function is called
//   try {
//     global.gc();
//   } catch (e) {
//     console.log("You must run program with 'node --expose-gc index.js' or 'npm start'");
//     process.exit();
//   }
 
//   //2. Output Heap stats
//   var heapUsed = process.memoryUsage().heapUsed;
//   console.log("Program is using " + heapUsed + " bytes of Heap.")
 
//   //3. Get Heap dump
//   process.kill(process.pid, 'SIGUSR2');
// }

/**
* APIをコールする関数。エラー処理にも対応。返り値に続きのデータを取得するためのURLがある場合、それらもまとめてDLされるように設計されている。
* エラー内容は取得せず、全ての処理が完了した際に呼び出されるcallbackAfterFinishingAllApiCallを呼び出す。
* @param {String} url: URL
* @param {callbackForParse} callbackForParse: 通信の返り値をパースする処理を記述する必要があるコールバック関数
*/
function callApi(url, callbackForParse, callbackAfterFinishingAllApiCall){
	var client = new Client();
	var req = client.get(url, function (data, response) {
		callbackForParse(data, response, callbackAfterFinishingAllApiCall)
	});

	req.once('error', function(error){
		logger.error('request error in callApi')
		callbackAfterFinishingAllApiCall()
	});
}

/**
 * 通信の返り値をパースする処理の関数
 * @callback callbackForParse
 * @param {Object} data - APIコールの返り値
 * @param {Object} response - APIコールのレスポンス
 * @param {callbackAfterFinishingAllApiCall} callbackAfterFinishingAllApiCall - 全ての通信が完了した際の処理を記述する必要があるコールバック関数。
 */

 /**
 * 全ての通信が完了した際の処理の関数
 * @callback callbackAfterFinishingAllApiCall
 */



/**
 * メッセージ取得APIの返り値をパースする処理の関数
 * @param {Object} data - APIコールの返り値
 * @param {Object} response - APIコールのレスポンス
 * @param {callbackAfterFinishingAllApiCall} callbackAfterFinishingAllApiCall - 全ての通信が完了した際の処理を記述する必要があるコールバック関数。
 */
function didDownloadedMessage(data, response, callbackAfterFinishingAllApiCall){
	var jsonData = JSON.parse(data);
	if(jsonData.error){
		if (jsonData.error.code){
			if(jsonData.error.code == 190){
				logger.error("継続不可能 in didDownloadedMessage")
			}
		}
	}else{
		var parsedResult = parseForFBMessages(jsonData)

		updateMessagesForImageUrls(parsedResult, function(messages){
			parsedResult.messages = messages
			//パースされた結果をDBに保存
			var collection = db.get(TABLE_NAME_MESSAGES);
			collection.find({}, function(err, records){
	    		if (err) throw err;

	    		saveOrUpdateRecord(collection, records, parsedResult.messages, 0, function(){
					if(parsedResult.next){
						callApi(parsedResult.next, didDownloadedMessage, callbackAfterFinishingAllApiCall)
					}else{
						callbackAfterFinishingAllApiCall()
					}
	    		})
			})
		})

		
	}
}

function updateMessagesForImageUrls(parsedResult, callback){
	parsedResult.messages = updateSingleMessageForImageUrls(parsedResult.messages, 0, callback)
}
function updateSingleMessageForImageUrls(messages, index, callback){

	if(index >= messages.length){
		callback(messages)
		return
	}

	

	var url = "https://graph.facebook.com/v2.6/" + messages[index].id + "/attachments?"
	var param = "";
	param = param + "access_token=" + accessToken;
	url = url + param
	
	callApi(url, didDownloadedImageUrlsForMessage, function(imageUrls){
		
		if(messages[index].hasPicture){
			messages[index].imageUrls = imageUrls
		}
		return updateSingleMessageForImageUrls(messages, index + 1, callback)
	})
}

/**
 * メッセージ取得APIの返り値をパースする処理の関数
 * @param {Object} data - APIコールの返り値
 * @param {Object} response - APIコールのレスポンス
 * @param {callback} callbackAfterFinishingAllApiCall - 画像配列を返すコールバック関数。
 */
function didDownloadedImageUrlsForMessage(data, response, callback){
	var jsonData = JSON.parse(data);
	if(jsonData.error){
		if (jsonData.error.code){
			if(jsonData.error.code == 190){
				logger.error("継続不可能 in didDownloadedImageUrlsForMessage")
				logger.error(jsonData)
			}
		}
		logger.log("cancel in didDownloadedImageUrlsForMessage")
		this.cancel = true
	}else{
		var imageUrls = parseForImgageUrlsOfFBMessages(jsonData)
		callback(imageUrls)
	}
}


// 
function parseForFBMessages(jsonData){
	var fbMessages = []
	var data = jsonData.data
	var i = 0
	for(i=0; i< data.length; i++){
		var fbMessage = new FBMessage(data[i])
		fbMessages.push(fbMessage)
	}

	var paging = jsonData.paging
	var next
	if(paging){
		next = paging.next
	}

	return {messages:fbMessages, next:next}
}

/**
 * メッセージに関連付けらている画像を取得するAPIのパーサー
 * @param {Object} jsonData - APIコールの返り値
 * @return {Array} imageUrls - 画像のURLの配列
 */
function parseForImgageUrlsOfFBMessages(jsonData){
	var imageUrls = []
	var data = jsonData.data

	if(!data){
		return null
	}

	var j = 0
	for(j=0; j<data.length; j++){
		var data1 = data[j]
		var subattachments = data1.subattachments

		if(subattachments){
			// メッセージに写真を添付している場合
			var data2 = subattachments.data
			var i = 0;
			for(i=0; i < data2.length; i++){
				var type = data2[i].type
				if(type == "photo"){
					var imageUrl = data2[i].media.image.src
					if(imageUrl){
						imageUrls.push(imageUrl)
					}
				}
			}
		}else{
			 // 写真を直接投稿している場合
			 var type = data1.type
			if(type == "photo"){
				var imageUrl = data1.media.image.src
				imageUrls.push(imageUrl)
			}
		}
	}
	return imageUrls
}

function saveOrUpdateRecord(collection, records, downloadedMessages, i, callback){
	if(!downloadedMessages || downloadedMessages.length <= i || downloadedMessages.length == null){
		callback()
		return
	}

	var j = 0
	var exisitingRecord
	for(j = 0; j < records.length; j++){
		if(records[j].id == downloadedMessages[i].id){
			exisitingRecord = records[j]
			break
		}
	}

	downloadedMessages[i].media = "FACEBOOK"

	if(exisitingRecord){
		if(exisitingRecord.updated_time == downloadedMessages[i].updated_time 
			&& exisitingRecord.message == downloadedMessages[i].message){
			// logger.debug("NoUpdate(" + exisitingRecord._id + "):" + downloadedMessages[i].id + " - " + downloadedMessages[i].message) 
			saveOrUpdateRecord(collection, records, downloadedMessages, i+1, callback)
		}else{
			logger.debug("Update(" + exisitingRecord._id + "):" + downloadedMessages[i].id + " - " + downloadedMessages[i].message)
			collection.update({
				_id: exisitingRecord._id
			},
			downloadedMessages[i]
			, function(err, result){
				if (err) throw err;
		        saveOrUpdateRecord(collection, records, downloadedMessages, i+1, callback)
			})
		}
	}else{
		logger.debug("add:" + downloadedMessages[i].id + " - " + downloadedMessages[i].message)
	// DBへのレコード追加,
	    collection.insert(downloadedMessages[i], function(err, record){
	        if (err) throw err;
	        saveOrUpdateRecord(collection, records, downloadedMessages, i+1, callback)
	    });
	}
}


logger.info('MyFaceBookApi - End');
module.exports = MyFaceBookApi;