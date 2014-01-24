/**
 * Created by vivaldi on 23.1.2014.
 */

angular.module('Deep.Controllers')
	.controller('GraphCtrl', function($scope, $rootScope, $routeParams, $graph, $log) {
		var graphHash = $routeParams.graph || false;

		$scope.errors = [];
		$scope.successes = [];
		$scope.graphData = null;

        if(!!graphHash) {

            // get the data for the selected graph
            $graph.getGraphList(graphHash)
                .then(
                    function(success) {

                        // generate graph data using the graph data obj
                        $graph.generateGraph(success[0])
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
        } else {
            $scope.errors.push("no graph")
        }
	});