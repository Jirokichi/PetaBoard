var log4js = require('log4js');
var logger = log4js.getLogger();
logger.info("@routes/api/messages.js");

var config = require('./config');
var DB_PATH = config.DB_PATH;
const TABLE_NAME = 'Messages';

var express = require('express');
var router = express.Router();

var monk = require('monk'); // not object but method
var db = monk(DB_PATH);

// ****************************************************
// 全件取得
// reqにlmtがある場合のみ、lmt以降に更新されたデータを取得
// ****************************************************
router.get('/', function(req, res) {
    var collection = db.get(TABLE_NAME);
    
    var query = {}
    if(req.query.lmt){
        query = {
            $where: 'this.updated_time > ' + req.query.lmt
        }
    }

    collection.find(query, {sort:{ updated_time : -1 } }).then(function(records){
        res.json(records);
    }).catch((err) =>{
        res.json(err);
    })
});

var collection = db.get(TABLE_NAME);

collection.find({$where:function(){
        return this.id == "589216234585999_589225127918443";
    }})
    .then(function(result){    
        logger.debug("testtest1 -> " + result.length)
    }).catch((err) => {
        logger.debug("testtest - error:")
        if (err) throw err;
    })

collection.find({ id: '589216234585999_589225127918443'}).then(function (result) {
    logger.debug("testtest2 -> " + result.length)
})

collection.find({ 
    $where: 'this.updated_time > 1466853666000.0'
    }).then(function (result) {
    logger.debug("testtest3 -> " + result.length)
})

// ****************************************************
// 取得：日付long以降に更新されたデータを取得
// ****************************************************
router.get('/:updated_date', function(req, res) {

    logger.info("get(updated_date) - " + req.params.updated_date);
    
    var whereCondition = 'this.updated_time > ' + req.params.updated_date
    
    var collection = db.get(TABLE_NAME);

    collection.find({
        $where:whereCondition
    }, {sort:{ updated_time : -1 }} , function(err, result){
        if (err) throw err;
        res.json(result);
    });
});









module.exports = router;