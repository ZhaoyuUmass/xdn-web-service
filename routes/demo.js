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

DOCKERS={'1': {name:'nodejs', url:'oversky710/tutorial-1', port:3000, exp_port:80},
	'2': {name: '', url:'', port:0, exp_port:0},
	'3': {name: '', url:'', port:0, exp_port:0}};

router.get('/', function (req, res) {
	res.render(DEMO);
});

router.get('/result', function (req, res) {
	res.render(THANK, {text: 'N/A'});
});

router.post('/result', function (req, res) {
	// console.log(">>>>>>>>>>>> "+req.body);
	// console.log(">>>>>>>>>>>> "+JSON.stringify(req.body));
	var result = JSON.parse(JSON.stringify(req.body));
	//result.clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	//result.agent = req.get('user-agent');
	//result.time = new Date();
	console.log(">>>>>>>>>>>> "+JSON.stringify(result));

	var docker_name = DOCKERS[result.docker].name;
	var url = DOCKERS[result.docker].url;
	var port = DOCKERS[result.docker].port;
	var exp_port = DOCKERS[result.docker].exp_port;

	var name = result.name+"."+docker_name+"."+DEFAULT_DOMAIN;
	var state = {NAME: docker_name, IMAGE_URL: url, VOL: docker_name, PORT:port, PUBLIC_EXPOSE_PORT: exp_port};

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
			delete_service(name);
		});
	};

	const request = http.request(options, callback);

	request.on('error', (error) => {
		console.log(error.message);
	});

	request.end();
});

router.post('/delete', function(req, res) {
});

router.get('/delete', function(req, res) {

	console.log(req);

	var name = req.query.name;

	console.log(new Date()+": about to delete service "+name);

	const parameters = {
		name: name,
		type: "DELETE"
	};

	const get_request_args = querystring.stringify(parameters);
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
			console.log("Service "+name+" successfully deleted!");
		});

		res.send(200);
	};

	const request = http.request(options, callback);

	request.on('error', (error) => {
		console.log(error.message);
	});

	request.end();
});

async function delete_service(name) {
	const delay = 1000*60*10; // 10 minutes
	await sleep(delay);

	console.log(new Date()+": about to delete service "+name);

	const parameters = {
		name: name,
		type: "DELETE"
	};

	const get_request_args = querystring.stringify(parameters);
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
			console.log("Service "+name+" successfully deleted!");
		});
	};

	const request = http.request(options, callback);

	request.on('error', (error) => {
		console.log(error.message);
	});

	request.end();
}

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}


module.exports = router;