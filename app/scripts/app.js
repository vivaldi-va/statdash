'use strict';

var statDashApp = angular.module('statDashApp', []);

/**
 * Routing configuration
 */
statDashApp.config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'views/login.html',
			controller: 'LoginCtrl'
		})
		.when('/dash', {
			templateUrl: 'views/dash.html',
			controller: 'DashCtrl'
		})
		.when('/explore', {
			templateUrl: 'views/explore/search.html',
			controller: 'ExploreCtrl'
		})
		.when('/explore/:set/analysis', {
			templateUrl: 'views/explore/analysis.html',
			controller: 'AnalysisCtrl'
		})
		.when('/explore/analysis/results', {
			templateUrl: 'views/explore/results.html',
			controller: 'ExploreResCtrl'
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



statDashApp
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
						if (data.logged_in === undefined) {
							dfd.reject('No connection to server could be made');
						} else {
							Global.loggedIn = true;
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
	})
	.factory('$explore', function($http, $q, $rootScope) {
		return {
			sets: {},

			/*
			 * graph object:
			 * 	name: graph name
			 * 	type: graph type
			 * 	axisX: x axis value
			 * 	axisY: y axis value
			 * 	constraint: constraint parameter
			 * 	set: set name to use
			 */
			graphs: {},
			/*
			 * start: start date,
			 * end: end date,
			 * location: location object (lat, long, coverage)
			 */
			params: {

			},
			search: function(query, filters) {
				var dfd = $q.defer();
				var params = {term: query, filter: 1};
				console.log(filters);
				if (filters.length>0) {
					filters =  filters.join('|');
					params['filter_terms'] = filters;
				}
				$http({
					url: '../../api/getSearchResults',
					method: 'GET',
					params: params
				})
					.success(function(data) {
						if(!!data == false) {
							dfd.reject('no results found');
						}
						dfd.resolve(data);
					})
					.error(function(e) {
						dfd.reject(e);
					});
				return dfd.promise;
			},
			getSets: function() {
				var self = this;
				if(!!localStorage.sets) {
					self.sets = JSON.parse(localStorage.sets);
				}

				return self.sets;
			},
			makeSet: function(setName, setData) {


				var self = this,
					setId,
					set = {name: setName, data: setData, length: setData.length},
					pulledSets;
				//console.log
				console.log(self.sets);


				setId = uniqueId();
				console.log(setId);
				self.sets[setId] = set;


				// check if localStorage supported
				if(!!localStorage) {
					// check sets exist in localstorage
					if(!!localStorage.sets) {
						// pull existing sets
						pulledSets = JSON.parse(localStorage.sets);
						// set new set as new object value
						pulledSets[setId] = set;
						// re-jsonify the localStorage sets collection
						localStorage.sets = JSON.stringify(pulledSets);
					} else {
						var initSets = {};
						initSets[setId] = set;
						// init localStorage item with new set
						localStorage.setItem('sets', JSON.stringify(initSets));
					}
				}


			},
			removeSet: function(setId) {
				var self=this,
					setsArr;

				delete self.sets[setId];
				console.log(self.sets);
				if(!!localStorage) {
					if(!!localStorage.sets) {
						var pulled = JSON.parse(localStorage.sets);
						delete pulled[setId];
						console.log(pulled);
						localStorage.sets = JSON.stringify(pulled);

					}
				}


				console.log(self.sets);
			},
			getGraphs: function() {
				var graphs = this.graphs;
				if(!!localStorage.graphs) {
					graphs = JSON.parse(localStorage.graphs);
					this.graphs = graphs;
				}

				console.log(graphs);

				return graphs;
			},
			addGraph: function(graph) {
				var graphId = uniqueId();
				this.graphs[graphId] = graph;
				if(!!localStorage) {
					if(!!localStorage.graphs) {
						var pulledGraphs = JSON.parse(localStorage.graphs);
						pulledGraphs[graphId] = graph;
						localStorage.graphs = JSON.stringify(pulledGraphs);
					} else {
						localStorage.setItem('graphs', JSON.stringify(this.graphs));
					}
				}
			},
			removeGraph: function(id) {
				var graphArr;

				if (!!localStorage.graphs) {
					graphArr = JSON.parse(localStorage.graphs);
				} else {
					graphArr = this.graphs();
				}

				/*
				 * find the set with the name that you want deleted,
				 * and delete the array value (which is all the set data)
				 */
				if (!!graphArr) {  //if there are any sets, just to make sure
					delete graphArr[id];
				}

				console.log(graphArr);

				if(!!localStorage) {
					if(!!localStorage.graphs) {
						localStorage.graphs = JSON.stringify(graphArr);
					} else {
						localStorage.setItem('graphs', JSON.stringify(graphArr));
					}
				}


				this.sets = graphArr;
			},
			cleanGraphSets: function(graphId, setId) {
				var graphs = this.getGraphs(),
					dirtyGraph = graphs[graphId];
				dirtyGraph.sets.splice(setId, 1);

				this.graphs = graphs;
				if(!!localStorage) {
					if(!!localStorage.graphs) {
						localStorage.graphs = JSON.stringify(graphs);
					} else {
						localStorage.setItem('graphs', JSON.stringify(graphs));
					}
				}

			}
		};
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
statDashApp.run(function ($location, $auth) {
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