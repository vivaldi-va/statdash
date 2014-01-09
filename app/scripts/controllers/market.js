angular.module('Deep.Controllers').controller('MarketCtrl', function($scope, $http, $q) {

	function getGraphData(termsData) {

		var dfd = $q.defer();
		$http({
			method: 'POST',
			url: '../../api/graph-test/',
			params: {graph: 'market'},
			data: termsData
		})
			.success(function(data) {
				console.log(data);
				dfd.resolve(data);
			})
			.error(function(reason) {
				console.log(reason);
				dfd.reject(reason);
			});
		return dfd.promise;
	}
	$scope.makeGraph = function() {

		console.log('hue');
		var termsData = [];



		for(var i=1;i<=5;i++) {
			if(!!$scope['term0' + i]) {
			console.log($scope['term0' + i]);
				termsData.push($scope['term0' + i]);
			}
		}



		console.log(termsData);

		getGraphData(termsData).then(function(data) {
			var marketShareCanvas = document.getElementById('market-share').getContext("2d");
			console.log(marketShareCanvas);
			var marketShareChart = new Chart(marketShareCanvas).Doughnut(data.data);




			$scope.legend = data.legend;
		});



	}

});
