var log4js = require('log4js');
var logger = log4js.getLogger();
function TestModule(str){
	this.str = str
}

TestModule.prototype.getLog = function(){
    logger.debug("**************************************");
    logger.debug("[GetLog]");
    logger.debug("str:" + this.str);
    logger.debug("**************************************");
}

module.exports = TestModule