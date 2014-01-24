angular.module('Deep.Controllers').controller('AnalysisCtrl', function($scope, $rootScope, $routeParams, $log, $explore, $set, $graph, $location) {
	console.log($routeParams['set']);
	var setName = $routeParams['set'];
	$scope.set = $explore.getSets();
	$scope.numGraphs = 0;
	$scope.selectedSets = {};
	$scope.graphs = null;

	$scope.errors = [];
	$scope.successes = [];




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


	$scope.makeGraph = function() {

		var sets = [];

		for(var s in $scope.selectedSets) {
			if(!!$scope.selectedSets[s]) sets.push(s);
		}

		$graph.makeGraph(sets, $scope.name, $scope.type).then(
			function(success) {
				$scope.successes.push(success.message);
				$log.info('DEBUG:', "created a graph", success.data);
			},
			function(reason) {
				$scope.errors.push(reason);
				$log.warn('ERR:', "graph creation failed", reason);
			}
		);
	};



})
	.controller('GraphListCtrl', function($scope, $explore) {
		var graphs = $explore.getGraphs(),
			sets = $explore.getSets();
		$scope.graphs = graphs;
		$scope.sets = $explore.sets;

		function _cleanGraphs() {
			for(var g in graphs) {
				var graphSets = graphs[g].sets;
				console.log(graphSets);
				for(var s in graphSets) {
					if(!sets[graphSets[s]]) {
						console.log("set " + s + " missing in " + g);
						$explore.cleanGraphSets(g, s);
						console.log(graphSets);
					}
				}
			}
			$scope.graphs = $explore.getGraphs();
		}

		_cleanGraphs();

		$scope.makeGraph = function() {
			var newGraph = {
				name: $scope.graphName,
				graph: $scope.graphPreset,
				constraint: null,
				sets: [],
				length: 0
			};

			/*
			 * add selected sets to graph
			 */
			for(var k in $scope.selectedSets) {
				if(!!$scope.selectedSets[k]) {
					newGraph.sets.push(k);
				}
			}
			$explore.addGraph(newGraph);
			//$explore.graphs.push(newGraph);
			console.log($explore.graphs);
			$scope.graphs = $explore.getGraphs();
		};

		$scope.removeGraph = function(id) {
			$explore.removeGraph(id);
			console.log($explore.graphs);
			$scope.graphs = $explore.getGraphs();
		}
	});
