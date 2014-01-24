/**
 * Created by vivaldi on 23.1.2014.
 */

angular.module('Deep.Controllers')
	.controller('GraphCtrl', function($scope, $rootScope, $routeParams, $graph, $log) {
		var graphHash = $routeParams.graph;

		$scope.errors = [];
		$scope.successes = [];
		$scope.graphData = null;

		$graph.getGraphList()
			.then(
			function(success) {
				var graph = success.data[0];
				var setHashArr = [];
				for(var s=0;s<graph.sets.length;s++) {
					setHashArr.push(graph.sets[s].hash);
				}
				// implode the set hashes for the graph into a string
				params.sets = setHashArr.join('|');


				//for(var g=0;g<graphs)

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
				$log.info('GEN GRAPH:', "after teh http");
			},
			function(reason) {
				$log.warn('GEN GRAPH:', "something went wrong getting graph data", reason);
				dfd.reject(reason);
			}
		);

		$graph.generateGraph(graphHash)
			.then(
				function(success) {

					$log.info('DEBUG:', "we should render the graph with this", success);
					$scope.graphData = success;
					/*for(var i=0;i<success.sets.length;i++) {

					}*/
				},
				function(reason) {
					$log.warn('ERR:', "something went wrong getting the graph", reason);
					$scope.errors = reason;
				}
			);
	});