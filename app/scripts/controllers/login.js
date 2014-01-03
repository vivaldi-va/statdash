statDashApp.controller('LoginCtrl', function($auth, $scope, $location) {

	//$scope.loginForm.$error.message = null;
	$scope.$on('$routeChangeSuccess', function() {$location.path('/dash')});
	$scope.submit = function() {
		/*
		 * Set the form to be 'dirty' on submitting.
		 * While this is done automatically when something is entered
		 * into a form field, this ensures it is set if no field
		 * is modified on submitting.
		 */
		$scope.loginForm.$setDirty();

		$auth.login($scope.email, $scope.password).then(
			function(status) {
				if (status.error.length > 0) {
					//directly attach error to login form
					$scope.loginForm.$error.message = status.error;
				} else {
					$location.path('/dash');
				}
			},
			function(reason) {
				$scope.loginForm.$error.message = reason;
			}
		);
	}
});