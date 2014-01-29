angular.module('Deep.Controllers').controller('AnalysisCtrl', function($scope, $rootScope, $routeParams, $log, $explore, $set, $graph, $location) {
	console.log($routeParams['set']);
	var setName = $routeParams['set'];
	$scope.set = $explore.getSets();
	$scope.numGraphs = 0;
	$scope.selectedSets = {};
	$scope.graphs = $rootScope.graphs;

	$scope.errors = [];
	$scope.successes = [];



	function getGraphList() {
		$graph.getGraphList()
			.then(
			function(success) {
				$scope.successes.push(success.message);
				$scope.graphs = success.data;
			},
			function(reason) {
				$scope.errors.push(reason);
			}
		);
	}

	if(!$scope.sets) {
		$set.getSets()
			.then(
				function(success) {
					$scope.sets = success;
				},
				function(reason) {}
			);
	}

	/**
	 * for each graph in the saved graph list
	 * get a list of it's sets that are referenced
	 * by id in graph.sets
	 *
	 * @param graph
	 */
	$scope.getGraphSets = function(graph) {
		/*var graphSets = graph.sets,
			setInfo = [],
			sets = $scope.set;
		      console.log(graph);

		*//*
		 * for each set in graph.sets
		 * get the set information that
		 * is stored
		 *//*
		for(var s in graphSets) {
			setInfo.push(sets[graphSets[s]]);
		}

		return setInfo;*/

	};


	$scope.doStuff = function() {
		$location.path('/explore/analysis/results');


	};

	if(!$scope.graphs) {
		 getGraphList();
	}


	$scope.makeGraph = function() {

		var sets = [];

		for(var s in $scope.selectedSets) {
			if(!!$scope.selectedSets[s]) sets.push(s);
		}

		$graph.makeGraph(sets, $scope.name, $scope.type).then(
			function(success) {
				$scope.successes.push(success.message);
				getGraphList();
				$log.info('DEBUG:', "created a graph", success.data);
			},
			function(reason) {
				$scope.errors.push(reason);
				$log.warn('ERR:', "graph creation failed", reason);
			}
		);
	};


	$scope.removeGraph = function(graph) {
		$graph.removeGraph(graph)
			.then(
				function(success) {
					$scope.successes.push(success);
					getGraphList();
				},
				function(error) {
					$scope.errors.push(error);
				}
			);
	};

	$scope.$on('$viewContentLoaded', function(){
		//$scope.getGraph
	});



});
