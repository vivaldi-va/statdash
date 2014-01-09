angular.module('Deep.Controllers').controller('GlobalCtrl', ['$scope', function($scope) {
	$scope.$back = function() {
		window.history.back();
	};

	$scope.$loading = function(status) {
		return !!status;
	};
}]);
