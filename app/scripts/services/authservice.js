/**
 * Created by vivaldi on 9.1.2014.
 */

angular.module('Deep.Services')
	.factory('$auth', function (Global, $rootScope, $http, $q) {
		var current_user = window.user;
		return {
			current_user: {
				company: {
					name: 'no name',
					brands: {}
				}

			},
			isSignedIn: function () {
				return !!current_user;
			},
			status: function () {
				var dfd = $q.defer(),
					self = this;

				$http({
					url: '../../api/checkLogin',
					method: 'GET'
				})
					.success(function (data) {
						if (!data.success) {
							dfd.reject('No connection to server could be made');
						} else {
							//Global.loggedIn = true;
							dfd.resolve(data);
						}
					})
					.error(function checkLoginError(e) {
						console.warn('login check failed: ' + e);
						dfd.reject(e);
					});

				return dfd.promise;
			},
			login: function (email, pass) {
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
			},
			logout: function () {

			}
		}
	});
