angular.module('Deep.Controllers').controller('ExploreCtrl', function($scope, $explore, $set, $location, $log) {

	$scope.errors = [];
	$scope.successes = [];

	$scope.exploreResults = null;
	$scope.activeFilters = {};
	//$scope.sets = $explore.getSets();
	$scope.sets = $set.getSets();

	$scope.numInSet = 0;
	$scope.results = 0;

	console.log($explore.sets);
	var selectedSet = [];

	$scope.search = function() {
		//$scope.exploreResults.error = null;
		var filters = $scope.activeFilters,
			filterArray = [];


		$('#explore-search [type="submit"]').button('loading');

		for(var f in filters) {
			if(!!filters[f]) {
				filterArray.push(f);
			}
		}
		$log.info('DEBUG: Filters ', filterArray);
		$scope.exploreSearch.$setDirty();
		$explore.search($scope.term, filterArray).then(
			function(data) {
				$log.info('DEBUG: search results retrieved ', data);
				$('#explore-search [type="submit"]').button('reset');
				console.log(data);
				$scope.exploreResults = data;
			},
			function(reason) {
				$log.warn('DEBUG: Search failed ', filterArray);
				$('#explore-search [type="submit"]').button('reset');
				$scope.exploreResultsError = reason;
			}
		);
	};


	function filter(listItem) {
		var matchAll = true;

		if (!!listItem.name) {
			for (var word in $scope.activeFilters) {



				if (!!$scope.activeFilters[word]) {
					//console.log($scope.activeFilters);
					//console.log(result.name);
					var regex = new RegExp(word),
						name = listItem.name.toLowerCase();
					//console.log(regex);
					//console.log(name);


					if (!name.match(regex)) {
						matchAll = false;
					}
				}

			}
		}
		return matchAll;
	}

	$scope.filterResults = function() {

	};

	// reset the filter checkboxes,
	// clear the selected filters scope object
	$scope.selectNone = function() {
		/*$('.filter-check').each(function(k, v) {
			$(this).attr('checked', false);
		});*/

		$scope.activeFilters = {};
	};


	$scope.selected = function (result)
	{
		var filteredCount = 0,
			list = $scope.exploreResults;
		for(var r in list) {
			//console.log(list[r]);
			if (!!filter(list[r])) {
				filteredCount++;
			}
		}
		//console.log(filteredCount);
		if(filteredCount>0){
			filteredCount-=1;
		}
		$scope.numInSet = filteredCount;
		return !!filter(result);
	};

	$scope.saveSet = function() {
		var products = $scope.exploreResults.results;
		var filterTerms = $scope.activeFilters;


		var setName = $scope.setName || false;



		// if there's any products in the results,
		// send to set service for the database adding
		if(products.length) {
			$set.makeSet(setName, products, $scope.term, filterTerms)
				.then(
					function(success) {

					},
					function(reason) {

					}
				);
		}

	};

	$scope.removeSet = function(id) {

		console.log(id);
		$explore.removeSet(id);
		console.log($explore.sets);
		$scope.sets = $explore.sets;
		/*
		if (!!$explore.sets()) {
			$scope.sets = $explore.sets();
		}*/
	};

	$scope.getSets = function() {
		$scope.sets = $set.getSets();
	};

	$scope.analysis = function() {

		// set Set as explore results for now until filters work.

		//$explore.set['set'] = $scope.exploreResults;
		// since we're using the search results, delete the filter terms for now
		//delete $explore.set['filter_terms'];
		// go to analysis page
		$location.path('/explore/set/analysis');



		$scope.analSet = $explore.set;

		setTimeout(function() {
			console.log("anal set:");
			console.log($scope.analSet);
			//console.log($explore.set());
		}, 100)
	}

});
