(function() {
    'use strict';
    var app = angular.module('app', [])
        .config(function($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
        });

    app.constant('API_URL', 'http://localhost:3000');
    app.controller('MainCtrl', ['RandomUserFactory', 'UserFactory', function(RandomUserFactory, UserFactory) {
        'use strict';

        var vm = this;
        vm.loggedUser = UserFactory.loggedUser();
        UserFactory.getUser().then(function(resp) {
            vm.user = resp.data;
        });

        vm.getRandomUser = function() {
            RandomUserFactory.getUser().then(function(resp) {
                vm.randomUser = resp.data;
            });
        };

        vm.doLogin = function(username, password) {
            UserFactory.login(username, password).then(function(resp) {
                vm.user = resp.data;
                vm.loggedUser = true;
            }, handleError);
        };

        vm.doLogout = function() {
            UserFactory.logout();
            vm.loggedUser = null;
            vm.user = null;

        };

        function handleError(resp) {
            console.log(resp);
            alert("Message: " + resp.data);
        };

    }]);

    app.factory('RandomUserFactory', ['$http', 'API_URL', function($http, API_URL) {
        'use strict';

        return {
            getUser: getUser
        };

        function getUser() {
            return $http.get(API_URL + '/random-user');
        };

    }]);

    app.factory('UserFactory', ['$http', '$q', 'API_URL', 'AuthTokenFactory', function($http, $q, API_URL, AuthTokenFactory) {
        'use strict';

        return {
            login: login,
            logout: logout,
            loggedUser: loggedUser,
            getUser: getUser
        };

        function loggedUser() {
            if (AuthTokenFactory.getToken()) {
                return true;
            }
            return false;
        }

        function login(username, password) {
            return $http.post(API_URL + '/login', {
                username: username,
                password: password
            }).then(function(resp) {
                AuthTokenFactory.setToken(resp.data.token);
                return resp;
            });
        }

        function logout() {
            AuthTokenFactory.setToken();
        }

        function getUser() {
            if (AuthTokenFactory.getToken()) {
                return $http.get(API_URL + '/me');
            } else {
            	return $q.reject({ data: 'client has no auth token'});
            }
        }

    }]);

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

})();
