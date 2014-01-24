/**
 * Created by vivaldi on 23.1.2014.
 */

angular.module('Deep.Controllers')
	.controller('GraphCtrl', function($scope, $rootScope, $routeParams, $graph, $log) {
		var graphHash = $routeParams.hash || false;

		$scope.errors = [];
		$scope.successes = [];
		$scope.graphData = null;

		$scope.width = window.innerWidth;
		$scope.height = $scope.width / 2;

		// get the data for the selected graph
		$graph.getGraphList(graphHash)
			.then(
			function(success) {

				$log.info('DEBUG:', "graph data", success);
				// generate graph data using the graph data obj
				$graph.generateGraph(success.data[0])
					.then(
					function(success) {
						$log.info('DEBUG:', "Got the graph data and added to scope", success);
						$scope.graphData = success;
					},
					function(reason) {
						$log.warn('ERR:', "generating graph failed because", reason);
						$scope.errors.push(reason);
					}
				);

				//for(var g=0;g<graphs)


			},
			function(reason) {
				$log.warn('GEN GRAPH:', "something went wrong getting graph data", reason);
				$scope.errors.push(reason);
			}
		);

		$scope.dateLabel = function() {
			return function(d) {
				//console.log(d3.time.format('%x')(new Date(d[0])));
				return d3.time.format('%x')(new Date(d));
			}
		};



        if(!!graphHash) {


        } else {
            $scope.errors.push("no graph")
        }
	});