# JSON Web Token on NG in Action

###### Content
- [Express Server](#express-server)
- [Angular](#angular)
- [Run Project](#run-project)

## Express Server
### Packages

- `body-parser` 
- `cors`: middle to allow Cross Origin Resource Sharing
- `morgan`: logger
- `jsonwebtoken`: middleware to sign a web token
- `express-jwt`: middleware that validates a JsonWebToken (JWT) and set the req.user with the attributes


### Npm install
`npm install body-parser morgan cors jsonwebtoken express-jwt`

### Login and sign token
Require module
```javascript
var express = require('express');
var faker = require('faker');	//module to generate fake data
var morgan = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
```
```javascript
// Secret, should declare in a separated file
var jwtSecret = 'sdcvbdfndgsdfavfndgfbs';

...

// 'authenticate' as a middleware to authenticate user prior signing token
app.post('/login', authenticate, function(req, res) {
	var token = jwt.sign({
		username: user.username
	}, jwtSecret);

    res.send({
    	username: user.username,
    	token: token
    });
});

...

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

```

### Protect Resource
use `express-jws` middleware, permit access to `/login`
```javascript
app.use(expressJwt({secret: jwtSecret}).unless({path: '/login'}));

```

## Angular
We will have 
**1. main controller**, 
**2. user factory**, 
**3. auth token factory**, and 
**4. auth interceptor** 

### Auth Token Factory
```javascript
app.factory('AuthTokenFactory', ['$window', function($window) {
    'use strict';

    var store = $window.localStorage;
    var key = 'auth-token';


    return {
        getToken: getToken,
        setToken: setToken
    };

    function getToken() {
        return store.getItem(key);
    }

    function setToken(token) {
        if (token) {
            store.setItem(key, token);
        } else {
            store.removeItem(key);
        }
    }
}]);
```

### Auth Interceptor
Purpose: intercept each outgoing $http request to add token to the header
```javascript
...
// app config
var app = angular.module('app', [])
    .config(function($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    });
...

app.factory('AuthInterceptor', ['AuthTokenFactory', function(AuthTokenFactory) {
    'use strict';

    return {
        request: addToken
    };

    function addToken(config) {
        var token = AuthTokenFactory.getToken();
        if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = 'Bearer ' + token;
        };

        return config
    }

}]);
```


