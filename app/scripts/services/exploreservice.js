/**
 * Created by vivaldi on 9.1.2014.
 */

angular.module('Deep.Services')
	.factory('$explore', function($http, $q, $log) {
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
				var params = {query: 'search', term: query};
				console.log(filters);
				if (filters.length>0) {
					filters =  filters.join('|');
					params['filter_terms'] = filters;
				}
				$http({
					url: 'api/',
					method: 'GET',
					params: params
				})
					.success(function(data) {
						if(!!data.error) {
							dfd.reject(data.error);
						}
						if(data.success) $log.info('DEBUG: ',data.data); dfd.resolve(data.data);
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
	});