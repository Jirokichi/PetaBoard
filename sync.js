const SYNC = true
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.info("@sync.js - " + SYNC)

const SocketInitialConnectOn = "connection"
const InitilizationRequest = "initialization_request"
const GroupRequest = "group_request"
const GroupMessagesRequest = "group_messages_request"
const IO_ADDED_MESSAGE = "IO_ADDED_MESSAGE"

const TABLE_NAME_SETTINGS = 'Settings';

var config = require('./routes/api/config');
var DB_PATH = config.DB_PATH;
var MyFaceBookApi = require('./routes/facebook/MyFaceBookApi')
var monk = require('monk'); // not object but method
var db = monk(DB_PATH);


var ErrorInfo = require("./routes/model/ErrorInfo")
var Group = require("./routes/model/Group")

var socketio = require('socket.io');

fb = new MyFaceBookApi(10000)

function MySync (server) {
  logger.info("MySync初期化")
  this.server = server
  this.io = socketio.listen(this.server);
}

MySync.prototype.startSync = function(){

  
  logger.info("**********************************")
  logger.info("startSync")
  logger.info("**********************************")

  logger.info("待ち状態(" + SocketInitialConnectOn + ") ---");
  //クライアントからの接続要求がくるとこのメソッドが呼ばれる
  this.io.sockets.on(SocketInitialConnectOn, function (personalSocket) {
    logger.info("**********************************")
    logger.info("SocketInitialConnectOn:" + SocketInitialConnectOn);
    logger.info("personalSocket:" + personalSocket);
    logger.info("**********************************")
  
  
    personalSocket.emit(InitilizationRequest, "接続直後にサーバーから送信するメッセージ", function(data){
        logger.info("送信済み - " + data);
    })

    // グループのリクエストがあったときの処理
    relatedGroupsProcess(personalSocket)


    logger.info("待ち状態(" + "emit_from_client" + ") ---");
    personalSocket.on('emit_from_client', function (msg, fn) {
      logger.info("emit_from_client");
      logger.info("msg:" + msg);

      fn("「サーバー受信しました」");
    });
    

    
    logger.info("待ち状態(" + "disconnection" + ") ---");
    personalSocket.on('disconnect', function (data) {
      logger.info("disconnect");
      logger.info("data:" + data);
    });


    // personalSocket.on(GroupMessagesRequest, function (requestRun){
    //   if(requestRun){
    //     var accessToken = "EAAKkj1obEnwBAJLALvcDWcFZCAmsh5KAtC09wNnhDMAYamZBMQjci0sS6aQuSaYmpna9gdlGVZCDEmMFdw6apPnNOZAWl4EAnapzdHFkGyaj8tugGKMgCyAqBRggPp7tFm3CExgt2R1ZB5sFiHHH2UdAsJ063IxIZD"
    //     var groupId = "589216234585999"
    //     this.fb.startSyncForGroupMessage(accessToken, groupId)
    //   }else{

    //   }
    // })
  });

  if(!SYNC){
    logger.info("**********************************")
    logger.info("Syncは有効化されていません")
    logger.info("**********************************")
    return
  }
  var accessToken = "EAAKkj1obEnwBAJLALvcDWcFZCAmsh5KAtC09wNnhDMAYamZBMQjci0sS6aQuSaYmpna9gdlGVZCDEmMFdw6apPnNOZAWl4EAnapzdHFkGyaj8tugGKMgCyAqBRggPp7tFm3CExgt2R1ZB5sFiHHH2UdAsJ063IxIZD"
  var groupId = "589216234585999"
  fb.startSyncForGroupMessage(accessToken, groupId)

}


// GroupRequestがきたら、
// DBに保存されているaccessTokenでgroupsを取得して、
// クライアントに結果を送信するためのメソッド
var relatedGroupsProcess = function(socket){
  logger.info("待ち状態(" + GroupRequest + ")...");
  socket.on(GroupRequest, function(data, fn){
    logger.info("Groupの取得を開始しました。少しお待ち下さい。")

    var collection = db.get(TABLE_NAME_SETTINGS);
    collection.find({}, function(err, records){
        if (err) throw err;
        if(records.length != 1){
          logger.debug("DBに設定がありません：" + records.length)
          var errorInfo = new ErrorInfo("accessTokenが不正な値です。");
          fn(errorInfo.getJson())
          return
        }

        var accessToken = records[0].accessToken
        logger.debug("次のアクセストークンでGroupsを取得します..." + accessToken);
        fb.getGroups(accessToken, function(result){
          logger.debug("jsonData:" + result);
          if(result.error){
            fn(result)
            return;
          }

          // 取得したGroupsでDBを更新する。
          // selectedGroupsは、もし取得したリストにない場合のみ消去し、
          // それ以外は過去のものを利用する。
          // @add!
          var dataObject = result.data;
          var i = 0;

          var groups = [];
          var selectedGroupId = records[0].selectedGroupId
          var isSelectedGroup = false
          for(i=0; i < dataObject.length; i++){
              var name = dataObject[i].name
              var privacy = dataObject[i].privacy
              var id = dataObject[i].id
              
              var group = new Group(name, privacy, id);
              group.log()
              groups.push(group)
              if(group.id == selectedGroupId){
                isSelectedGroup = true
                selectedGroup = group
              }
          }
          logger.debug("isSelectedGroup:" + isSelectedGroup);
          if(isSelectedGroup){
            logger.debug("選択済みグループをそのまま選択");
            records[0].selectedGroupId = selectedGroupId
            records[0].groups = groups
          }else{
            logger.debug("選択済みグループがないので、未選択にする");
            records[0].selectedGroupId = ""
            records[0].groups = groups
          }
          fn(records[0]);
        })

        
    })
  })
}


module.exports = MySync;