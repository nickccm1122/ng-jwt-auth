var express = require('express');
var faker = require('faker');
var morgan = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

// hardcode secret
var jwtSecret = 'sdcvbdfndgsdfavfndgfbs';

// Hardcode user data
var user = {
    username: 'nick',
    password: '12345678'
}

var hostname = "localhost";
var port = 3000;
var app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(expressJwt({secret: jwtSecret}).unless({path: '/login'}));

app.get('/random-user', function(req, res) {
	console.log(req);
    var user = faker.helpers.userCard();
    user.avatar = faker.image.avatar();
    res.json(user);
});

app.get('/me', function(req, res) {
	res.send(req.user);
});

app.post('/login', authenticate, function(req, res) {
	var token = jwt.sign({
		username: user.username
	}, jwtSecret);

    res.send({
    	username: user.username,
    	token: token
    });
});


app.listen(port, hostname, function() {
    console.log('Listening to port: ', port);
});


// Util functions

function authenticate(req, res, next) {
    var body = req.body;

    if (!body.username || !body.password) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Must provide username/password');
    } else {

        if (body.username !== user.username || body.password !== user.password) {
            console.log(body.username)
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('username/password incorrect');
        } else {
            next();
        }
    }
}
