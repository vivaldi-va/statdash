angular.module('Deep.Controllers').controller('DashCtrl', function($scope) {
	$('#tool-nav .btn').each(function(k, v) {
		$(this).tooltip({container: 'body', placement: 'left', delay: {show: 1000, hide: 250}});
	});
});