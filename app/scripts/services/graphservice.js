/**
 * Created by vivaldi on 23.1.2014.
 */

angular.module('Deep.Services')
	.factory('$graph', function($http, $q, $log, $rootScope) {

		$rootScope.graphs = null;

		function _makeGraph(sets, name, type) {

			var dfd = $q.defer();

			if(!name || !name.length) dfd.reject("graph is missing a name");
			if(!sets || !sets.length) dfd.reject("no sets selected for graph");
			if(!type) dfd.reject("no graph type selected");


			var data = {
				"name": name,
				"type": type,
				"sets": sets
			};

			$http({
				url: "../api/",
				method: 'POST',
				data: data,
				params: {"query": 'newgraph'}
			})
				.success(function(data) {
					$log.info('DEBUG:', "graph creation result", data);
					if(!data.success) dfd.reject(data.error);
					if(!!data.success) dfd.resolve(data);
				})
				.error(function(reason) {
					dfd.reject(reason);
				});

			return dfd.promise;
		}

		function _getGraphList(graph) {
			var params = {"query": 'getgraphs'},
				dfd = $q.defer();

			graph = graph || null;

			if(!!graph) {
				params.graph = graph;
			}

			$http({
				url: '../api/',
				method: 'get',
				params: params
			})
				.success(function(data) {
					if(!data.success) dfd.reject(data.error);
					if(!!data.success) {

						if(!graph) {
							$rootScope.graphs = data.data;
						}
						dfd.resolve(data);
					}
				})
				.error(function(reason) {
					$log.warn('HTTP:', "getting graphs failed", reason);
					dfd.reject(reason);
				});
			return dfd.promise;
		}


        /**
         * Generate graph data for checkout (for now) using a supplied graph info object
         *
         * @param graph the graph object
         * @returns {promise} a promise which resolves to the graph data or an error
         * @private
         */
		function _generateGraph(graph) {
			var dfd = $q.defer();
			var params = {"query": 'getcheckouttime', "sets": null};

            // create the string of pipe delimited set hashes
            var setHashArr = [];
            for(var s=0;s<graph.sets.length;s++) {
                setHashArr.push(graph.sets[s].hash);
            }
            // implode the set hashes for the graph into a string
            params.sets = setHashArr.join('|');

            $http({
                url: '../api/',
                method: 'get',
                params: params
            })
                .success(function(data) {
                    $log.info('DEBUG:', "Got graph data for graph ", graph, data);
                    if(!data.success) dfd.reject(data.error);
                    if(!!data.success) dfd.resolve(data.data);
                    $log.info('GEN GRAPH:', "still in success");
                })
                .error(function(reason) {
                    $log.warn('GEN GRAPH:', "generating graph values didnt work", reason);
                    dfd.reject(reason);

                });


			$log.info('GEN GRAPH:', "escaped the callback");
			return dfd.promise;
		}

		return {
			getGraphList: _getGraphList,
			makeGraph: _makeGraph,
			generateGraph: _generateGraph
		};
	});
