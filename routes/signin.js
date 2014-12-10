var fs = require('fs');
var http = require('http');
var express = require('express');
var ejs = require('ejs');
var pool = require('../modules/database.js');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var crypto = require('crypto');


var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var router = express.Router();

router.get('/', function (request, response, next) {
	if (request.cookies.logined) {
		response.redirect('/main');
	} else {
		response.redirect('/signup');
	}
});

router.get('/signup', function (request, response, next) {
	response.render('signup');
});

router.get('/main', function (request, response, next) {
	response.render('main');
});

router.get('/login', function (request, response, next) {
	response.render('login');
});

router.post('/login', function (request, response, next) {
	var email = request.param('email');
	var password = request.param('password');
	console.log('login request : ',email, password);
	var shasum = crypto.createHash('sha1');
	shasum.update(password);
	password = shasum.digetst('hex');
	pool.getConnection(function (error, connection) {
		connection.query('SELECT * FROM user WHERE email="'+email+'";', function (error, result, fields) {
			console.log('isRightAuth called');
			connection.release();
			if(error) {
				console.log('쿼리 문장에 오류가 있습니다.');
				response.redirect('/login');
			} else {
				if(result[0]) {
					console.log("has result");
					if(result[0]['password'] == password) {
						console.log('RightAuth');
						response.cookie('logined', true);
						response.redirect('/');
					}
					else {
						console.log('Wrong pw');
						response.redirect('/login');
					}
				} else {
					console.log("no result");
					response.redirect('/login');
				}
			}
		});
	});
});

router.post('/signup', function (request, response, next) {
	console.log('hellooo newbie');
	var email = request.param('email');
	var password = request.param('password');
	console.log('signup request : ',email, password);
	var shasum = crypto.createHash('sha1');
	shasum.update(password);
	password = shasum.digetst('hex');

	var statement = 'INSERT INTO user (email, password) VALUES("'+email+'","'+password+'");';
	console.log('statement:'+statement);
	pool.getConnection(function(error, connection) {
		connection.query(statement, function (error, result, fields) {
			connection.release();
			if (error) {
				console.log('error:'+error);
				response.redirect('/signup');
			} else {
				if (result) {console.log('result:'+result);}
				response.cookie('logined', true);
				response.redirect('/');
			}
		});
	});
});


module.exports = router;