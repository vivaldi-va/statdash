/**
 * Created by vivaldi on 10.1.2014.
 */

angular.module('Deep.Controllers')
	.controller('RegisterCtrl', function($scope, $location, $auth) {

		$scope.errors = [];

		$scope.submit = function() {

			if(!$scope.email) $scope.errors.push('no email entered');
			if(!$scope.password) $scope.errors.push('no password entered');
			if(!$scope.name) $scope.errors.push('no name entered');

			$auth.createUser($scope.email, $scope.name, $scope.password).then(
				function(success) {
					$location.path('/dash');
				},
				function(reason) {
					$scope.errors.push(reason);
				}
			);

		};
	});
