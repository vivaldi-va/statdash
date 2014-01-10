/**
 * Created by vivaldi on 9.1.2014.
 */

angular.module('Deep.Services')
	.factory('$auth', function (Global, $rootScope, $http, $q, $log) {
		var current_user = {
			"email": null,
				"company": {
					"name": 'no name',
					"brands": []
				}
			};


		function _isSignedIn() {}

		function _status() {
			var dfd = $q.defer(),
				self = this;

			$http({
				url: '../api/',
				params: {query: 'checksession'},
				method: 'GET'
			})
				.success(function (data) {
					if (!data.success) {
						dfd.reject('No connection to server could be made');
					} else {
						//Global.loggedIn = true;
						$log.info('DEBUG', "current_user: ", current_user);
						current_user.email = data.data.email;
						dfd.resolve(data);
					}
				})
				.error(function checkLoginError(e) {
					console.warn('login check failed: ' + e);
					dfd.reject(e);
				});

			return dfd.promise;
		}

		function _login(email, pass) {
			var dfd = $q.defer();
			$http({
				url: '../../login/',
				method: 'GET',
				params: {email: email, pass: pass}
			})
				.success(function (data) {
					if (data.success === undefined) {
						dfd.reject('No connection to server could be made');
					} else {
						Global.loggedIn = true;
						dfd.resolve(data);
					}
				})
				.error(function (reason) {
					dfd.reject('Could not sign in, try again soon!');
				});

			return dfd.promise;
		}

		function _logout() {}

		function _createUser(email, name, pass) {
			var dfd = $q.defer();

			$http({
				url: '../api/',
				method: 'post',
				params: {query: 'register'},
				data: {email: email, name: name, password: pass}
			})
				.success(function(status) {
					if (!status.success) dfd.reject(status.error);
					if (!!status.success) dfd.resolve(status.message);
				})
				.error(function(reason) {
					dfd.reject(reason);
				});

			return dfd.promise;
		}


		return {
			current_user: current_user,
			status: _status,
			login: _login,
			logout: _logout,
			createUser: _createUser
		}
	});
