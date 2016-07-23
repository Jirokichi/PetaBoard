// ***********************************************************
// Settings Tableはレコードを一つしか作成できないものとしている。
// ***********************************************************
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.info("@routes/api/settingApi.js")


var config = require('./config');
var DB_PATH = config.DB_PATH;
const TABLE_NAME = 'Settings';

var express = require('express');
var router = express.Router();

var monk = require('monk'); // not object but method
var db = monk(DB_PATH);

var MyFaceBookApi = require('../facebook/MyFaceBookApi')

// ****************************************************
// Module定義
// ****************************************************
var SettingModule = require("../model/SettingModule")
var ErrorInfo = require("../model/ErrorInfo")
// var TestModule = require("../../model/testModule")
// var t = new TestModule("a")
// t.getLog()

// ****************************************************
// 取得
// ****************************************************
// すべてののレコード
router.get('/', function(req, res) {
    var collection = db.get(TABLE_NAME);
    collection.find({}, function(err, records){
        if (err) throw err;
      	res.json(records);
    });
});



// ****************************************************
// 追加
// ****************************************************
// 初めての投稿時のみ使われる
router.post('/', function(req, res){
    var collection = db.get(TABLE_NAME);
    logger.info("post：" + req.body);
    var settingModule = new SettingModule(req);
    settingModule.getLog();


    if(settingModule.accessToken == null || settingModule.accessToken == ""){
        logger.info("もらったデータが不正。");
        var errorInfo = new ErrorInfo("accessTokenが不正な値です。");
        res.json(errorInfo.getJson());
        return;
    }

    logger.info("DBの検索");
    collection.find({}, function(err, records){
        logger.info("- 検索結果:" + records.length);
        if (err) throw err;
        // Settingテーブルは一つしかレコードが作成できない
        if(records.length != 0){
            logger.error("すでに登録されています：" + records.length);
            var errorInfo = new ErrorInfo("すでに登録されています");
            res.json(errorInfo.getJson());
        }else{
            // DBへのレコード追加
            logger.info("DBへの追加 - ");
            collection.insert(
                settingModule.getJson(), function(err, record){
                if (err) throw err;
                res.json(record);
            });
        }
    });    
});

// ****************************************************
// 更新
// ****************************************************
router.put('/:id', function(req, res){

    var id = req.params.id

    logger.info("put - " + id);
    logger.debug("req.authtoken:" + req.body.accessToken);
    var settingModule = new SettingModule(req);
    settingModule.getLog();
    if(settingModule.accessToken == null || settingModule.accessToken == ""){
        logger.info("もらったデータが不正。");
        var errorInfo = new ErrorInfo("accessTokenが不正な値です。");
        res.json(errorInfo.getJson());
        return;
    }

    // 認証トークンで通信してグループを取得する
    fb = new MyFaceBookApi(0)
    fb.checkAccessTokenIsActiveOrNot(settingModule.accessToken
        , function(result){
            logger.info(result);
            if(result.error){
                logger.info("エラー:" + result.error.message);
                var errorInfo = new ErrorInfo(result.error.message)
                res.json(errorInfo.getJson());
                return;
            }
            else{
                var collection = db.get(TABLE_NAME);
                logger.info("update - " + id);
                collection.update({
                        _id: id
                    },
                    settingModule.getJson()
                    , function(err, result){
                        logger.info("after Update - " + err);
                        if (err) throw err;
                        res.json(result);
                });
            }
    });
});


// ****************************************************
// 取得
// ****************************************************
// 特定のID
router.get('/:id', function(req, res) {

    logger.info("get - " + req.params.id);
    var collection = db.get(TABLE_NAME);
    collection.findOne({ _id: req.params.id }, function(err, result){
        if (err) throw err;
        res.json(result);
    });
});

// ****************************************************
// 削除
// ****************************************************
// req.bodyに1レコードがセットされている
router.delete('/:id', function(req, res){
    logger.info("delete - " + req.params.id);
    var collection = db.get(TABLE_NAME);
    collection.remove({ _id: req.params.id }, function(err, result){
        if (err) throw err;
        res.json(result);
    });
});


module.exports = router;