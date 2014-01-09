angular.module('Deep.Controllers').controller('ExploreCtrl', function($scope, $explore, $location, $log) {
	$scope.exploreResults = null;
	$scope.activeFilters = {};
	//$scope.sets = $explore.getSets();
	$scope.sets = $explore.getSets();

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

	$scope.selectNone = function() {
		$('.filter-check').each(function(k, v) {
			$(this).attr('checked', false);
		});

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

	$scope.saveSet = function(list, numMatches) {

		var filteredSet = [],
			words = [],
			setName = "";







		/*
		 * Create the set name from the active filters
		 */

		setName = $scope.term;
		for(var word in $scope.activeFilters) {
			if (!!$scope.activeFilters[word]) {
				if(setName==="") {
					setName += word;
				} else {
					setName += " ";
					setName += word;
				}
			}
		}


		/*
		 * add the filtered products into a temp array
		 */
		if (numMatches > 0) {
			for(var r in list) {
				//console.log(list[r]);
				if (!!list[r].filter_match) {
					filteredSet.push(list[r].id);
				}
			}
		} else {
			for(var r in list) {
				//console.log(list[r]);
				filteredSet.push(list[r].id);
			}
		}
		// add the filtered set to localStorage
		$explore.makeSet(setName, filteredSet);
		$scope.sets = $explore.sets;
		console.log(filteredSet);

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
