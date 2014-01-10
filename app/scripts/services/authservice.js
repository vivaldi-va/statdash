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

		function _status() {
			var dfd = $q.defer(),
				self = this;

			$log.info('AUTH', "checking session");
			$http({
				url: '../api/',
				params: {query: 'checksession'},
				method: 'GET'
			})
				.success(function (data) {
					if (!data.success) {
						$log.info('AUTH', data.message);
						dfd.reject(data.message);
					} else {
						//Global.loggedIn = true;
						$log.info('AUTH', "session found for user: ", current_user);
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
				url: '../api/',
				method: 'post',
				params: {query: 'login'},
				data: {email: email, password: pass}
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

		function _logout() {
			var dfd = $q.defer();
			$log.info('AUTH', 'Logout');
			$http({
				url: '../api/',
				method: 'get',
				params: {query: 'logout'}
			})
				.success(function(status) {
					if (!!status.message)  {

						dfd.resolve(status.message);
						$log.info('AUTH', 'Logout successful');
					}
				})
				.error(function(reason) {
					$log.info('AUTH', 'something went wrong because ', reason);
					dfd.reject(reason);
				});

			return dfd.promise;
		}

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
