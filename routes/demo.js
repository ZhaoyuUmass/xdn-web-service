/**
 * Created by gaozy on 6/6/21.
 */

var express = require('express');
const querystring = require('querystring');
var http = require('http');

var router = express.Router();

const DEMO = 'test/demo';
const THANK = 'test/thank';

const DEFAULT_DOMAIN = 'xdnedge.xyz';


router.get('/', function (req, res) {
	res.render(DEMO);
});



router.post('/result', function (req, res) {
	var result = JSON.parse(JSON.stringify(req.body));
	result.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	result.agent = req.get('user-agent');
	result.time = new Date();
	// console.log(">>>>>>>>>>>> "+JSON.stringify(result));

	var word = result.port.split(":");


	var port = Number(word[1]);
	var exp_port = Number(word[0]);

	var name = result.name+"."+result.docker+"."+DEFAULT_DOMAIN;
	var state = {NAME: result.docker, IMAGE_URL: result.url, VOL: result.docker, PORT:port, PUBLIC_EXPOSE_PORT: exp_port};

	const parameters = {
		name: name,
		type: "CREATE",
		INITIAL_STATE: JSON.stringify(state)
	};

	const get_request_args = querystring.stringify(parameters);
	// var p = '/?type=CREATE&name='+name+'&init_state='+JSON.stringify(state);

	// console.log(get_request_args);

	var options = {
		host: 'ns1.xdn-service.xyz',
		port: 5300,
		// path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
		path: '/?'+get_request_args
	};

	var callback = function(response) {
		var str = '';

		//another chunk of data has been received, so append it to `str`
		response.on('data', function (chunk) {
			str += chunk;
		});

		//the whole response has been received, so we just print it out here
		response.on('end', function () {
			console.log(str);
			var r = JSON.parse(JSON.stringify(str));
			res.render(THANK, {text: 'http://'+name});
		});
	};

	const request = http.request(options, callback);

	request.on('error', (error) => {
		console.log(error.message);
	});

	request.end();
});

module.exports = router;