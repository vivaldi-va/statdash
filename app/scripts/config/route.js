/**
 * Created by vivaldi on 9.1.2014.
 */

angular.module('Deep.Route')
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl'
			})
			.when('/login', {
				templateUrl: 'views/login.html',
				controller: 'LoginCtrl'
			})
			.when('/register', {
				templateUrl: 'views/register.html',
				controller: 'RegisterCtrl'
			})
			.when('/dash', {
				templateUrl: 'views/dash.html',
				controller: 'DashCtrl'
			})
			.when('/explore', {
				templateUrl: 'views/explore/search.html',
				controller: 'ExploreCtrl'
			})
			.when('/explore/analysis', {
				templateUrl: 'views/explore/analysis.html',
				controller: 'AnalysisCtrl'
			})
			.when('/explore/analysis/results', {
				templateUrl: 'views/explore/results.html',
				controller: 'ExploreResCtrl'
			})
			.when('/graph/:hash', {
				templateUrl: 'views/graph.html',
				controller: 'GraphCtrl'
			})

			.when('/market', {
				templateUrl: 'views/market/terms.html',
				controller: 'MarketCtrl'
			})

			.when('/market/results', {
				templateUrl: 'views/market/results.html',
				controller: 'MarketCtrl'
			})

			.when('/checkout', {
				templateUrl: 'views/check/totals.html',
				controller: 'CheckoutCtrl'
			})

			.otherwise({
				redirectTo: '/'
			});
	});