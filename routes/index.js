var log4js = require('log4js');
var logger = log4js.getLogger();
logger.info("@routes/index.js");

var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res) {
// 	// res has the following methods
// 	// - render: to render a view
// 	// - send: to send plain text content to the client
// 	// - json: to send a json object to the client
// 	// - redirect: to redirect the client to a new address
// 	// var res_vals ={}
// 	// res_vals.title='Wedding Installation';
//     res_vals.publishers={
//         '1111':'GroupA',
//         '2222':'GroupB',
//         '3333':'GroupC'
//     }
// 	console.log(res_vals);
//     res.render('index', res_vals);
// });

router.get('/', function(req, res, next) {
	logger.info("index.js");
	res.render('index', {});
});
		

module.exports = router;
