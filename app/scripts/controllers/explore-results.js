angular.module('Deep.Controllers').controller('ExploreResCtrl', function ($scope, $http, $q, $explore)
{
	var graphs = $explore.getGraphs(),
		sets = $explore.getSets();
	console.log($explore.getGraphs());
	for(var g in graphs) {
		console.log(graphs[g].sets);
		var setsTemp = {};
		for(var set in graphs[g].sets) {
			var setId = graphs[g].sets[set];
			setsTemp[setId] = sets[setId];
			//delete graphs[g].sets[set];
			console.log(sets[setId]);
			console.log(graphs[g].sets[set]);
		}
		graphs[g].sets = setsTemp;
		console.log(graphs[g].sets);
	}



	console.log(graphs);
	function _processGraphs(graphs) {
		var dfd = $q.defer();
		$http({
			url: '../../api/graph-test/',
			method: 'POST',
			data: graphs,
			params: {graph: 'setcompare'}
		})
			.success(function(data) {
				console.log(data);

				if(!!data.error) {
					dfd.reject(data.error);
				} else {
					dfd.resolve(data);
				}

			})
			.error(function(reason) {
				console.log(reason);
				dfd.reject(reason);
			});

		return dfd.promise;
	}

	function _renderGraph(graph, id) {
		console.log(document.getElementById(id));
		var canvas = document.getElementById(id).getContext("2d");
		console.log(canvas);
		document.getElementById(id).width =  document.getElementById(id).parentNode.offsetWidth;
		var marketShareChart = new Chart(canvas).Line(graph);
	}

	_processGraphs(graphs).then(
		function(data) {
			$scope.graphs = data;

			/*
			 * Timeout to allow DOM rendering
			 */
			setTimeout(function(){
				for(var g in data) {
					console.log(g);
					for(var i in data[g].datasets) {
						for(var val in data[g].datasets[i].data) {
							data[g].datasets[i].data[val] = parseInt(data[g].datasets[i].data[val]);
						}
					}
					_renderGraph(data[g], g);
				}

			},250);
		}
	);

});