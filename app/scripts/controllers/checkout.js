statDashApp.controller('CheckoutCtrl', function($scope, $q, $http) {
	function getGraphData() {
		var dfd = $q.defer();

		$http({
			url: '../../api/graph-test',
			method: 'get',
			params: {graph: 'dailycheckout'}
		})
			.success(function(data) {
				if (!!data.error) {
					dfd.reject(data.error);
				} else {
					dfd.resolve(data);
				}
			})
			.error(function(reason) {

			});

		return dfd.promise;
	}

	getGraphData().then(function(data) {
		console.log(data);
		var marketShareCanvas = document.getElementById('dashGraph01').getContext("2d");
		console.log( marketShareCanvas.parentNode);
		document.getElementById('dashGraph01').width =  document.getElementById('dashGraph01').parentNode.offsetWidth;
		console.log(marketShareCanvas);
		var marketShareChart = new Chart(marketShareCanvas).Line(data);
	});

});

