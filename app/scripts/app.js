'use strict';

angular.module('Deep.Route', []);
angular.module('Deep.Services', []);
angular.module('Deep.Controllers', []);
angular.module('Deep.Filters', []);

angular.module('Deep', ['Deep.Route', 'Deep.Services', 'Deep.Controllers', 'Deep.Filters'])
	.run(function ($location, $auth) {
		var status = $auth.status();

		status.then(
			function (status) {
				if (!!status.logged_in) {
					if ($location.path() == '/') {
						$location.path('/dash');
					}
				} else {
					$location.path('/');
				}
			},
			function (reason) {

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
