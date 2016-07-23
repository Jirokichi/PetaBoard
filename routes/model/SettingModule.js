var log4js = require('log4js');
var logger = log4js.getLogger();

// ****************************************************
// SettingModule
// ****************************************************
function SettingModule(req){  //コンストラクタ(もどき)
    this.accessToken         = req.body.accessToken;    //認証トークン
    this.appId               = req.body.appId;
    this.secret              = req.body.secret;
    this.selectedGroupId     = req.body.selectedGroupId;
    this.groups              = req.body.groups;

    if(!req.body.runingSync){
        this.runingSync       = false;
    }else{
        this.runingSync       = req.body.runingSync;
    }
}

SettingModule.prototype.getJson = function(){
    var json = {
                accessToken         : this.accessToken,
                appId               : this.appId,
                secret              : this.secret,
                selectedGroupId     : this.selectedGroupId,
                groups              : this.groups,
                runingSync           : this.runingSync
            };
    return json;
}

SettingModule.prototype.getLog = function(){
    logger.debug("**************************************");
    logger.debug("[GetLog]");
    logger.debug("accessToken:" + this.accessToken);
    logger.debug("appId:" + this.appId);
    logger.debug("secret:" + this.secret);
    logger.debug("selectedGroupId:" + this.selectedGroupId);
    logger.debug("groups:" + JSON.stringify(this.groups));
    logger.debug("runingSync:" + JSON.stringify(this.runingSync));
    logger.debug("**************************************");
}

module.exports = SettingModule