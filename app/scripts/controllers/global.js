angular.module('Deep.Controllers').controller('GlobalCtrl', ['$scope', '$location', '$auth', '$log', '$location', function($scope, $location, $auth, $log, $location) {
	$scope.$back = function() {
		window.history.back();
	};

	$scope.$loading = function(status) {
		return !!status;
	};

	$scope.$logout = function() {
		$auth.logout().then(
			function (success) {
				$log.info('GLOBAL', 'Logout:', "logout successful");
				$location.path('/');
			},
			function (reason) {}
		);
	};

	$scope.$path = function(path) {
		$log.info('DEBUG:', "new path", path);
		$location.path(path);
	};
}]);
