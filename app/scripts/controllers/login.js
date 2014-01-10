angular.module('Deep.Controllers').controller('LoginCtrl', function($auth, $scope, $location, $log) {

	//$scope.loginForm.$error.message = null;
	//$scope.$on('$routeChangeSuccess', function() {$location.path('/dash')});
	$scope.submit = function() {
		/*
		 * Set the form to be 'dirty' on submitting.
		 * While this is done automatically when something is entered
		 * into a form field, this ensures it is set if no field
		 * is modified on submitting.
		 */


		$scope.loginForm.$setDirty();
		$scope.loginForm.$error = [];
		$auth.login($scope.email, $scope.password).then(
			function(status) {
				if (!!status.error) {
					//directly attach error to login form
					$scope.loginForm.$error.message = status.error;
				}

				if (!!status.success) {
					$log.info('DEBUG', "Login Controller:", "login successful");
					$location.path('/dash');
				}
			},
			function(reason) {
				$scope.loginForm.$error.message = reason;
			}
		);
	}
});