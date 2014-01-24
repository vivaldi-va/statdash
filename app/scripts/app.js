'use strict';
// init the modules
angular.module('Deep.Route', []);
angular.module('Deep.Services', []);
angular.module('Deep.Controllers', []);
angular.module('Deep.Filters', []);

// initialize the application
angular.module('Deep', ['ngRoute', 'Deep.Route', 'Deep.Services', 'Deep.Controllers', 'Deep.Filters', 'nvd3ChartDirectives'])
	.run(function ($location, $auth, $log) {
		$log.info('INIT', "checking session");
		$auth.status().then(
			function (status) {
				//$log.info('INIT', "checking session succeeded", status);
				$log.info('INIT', "session found", status);
				$log.info('DEBUG', "Path on init", $location.path());
				if ($location.path() == '/' || $location.path() === '/login') {
					$location.path('/dash');
				}

			},
			function (reason) {
				$log.info('INIT', "no user session found because", reason);
				$location.path('/login');
			}
		);
	});




angular.module('Deep.Services')
	.factory('Global', function() {
		return {
			loggedIn: false,
			user: {
				name: null,
				email: null
			},
			loading: false

		}
	})

	/**
	 * order filter matches so that positive matches
	 * are shown at the top of the search list
	 */
	.filter('filterMatches', function() {
		return function (items) {
			var filtered = [];

			/*
			 * push items into an array, due to filtering not
			 * being possible on hashes or objects.
			 */
			angular.forEach(items, function(item) {
				filtered.push(item);
			});


			filtered.sort(function(a,b) {
				if (!!a.filter_match && !b.filter_match) return -1;
				if (!a.filter_match && !!b.filter_match) return 1;
				return 0;
			});

			return filtered;
		}
	});

/**
 * Check login on run,
 * redirect to login screen if not logged in
 */
