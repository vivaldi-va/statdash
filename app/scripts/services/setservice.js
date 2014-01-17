/**
 * Created by vivaldi on 15.1.2014.
 */

angular.module('Deep.Services')
	.factory('$set', function($http, $q, $log) {



		function _makeSet(setName, setData, searchTerm, filters) {


			var 	self = this
				,	setId
				,	setProductIds = []
				,	pulledSets
				,	dfd = $q.defer();


			//setId = _uniqueId();


			for(var i=0;i<setData.length;i++) {
				setProductIds.push(setData[i].id);
			}

			// if the set name is not set,
			// create it from search term and filters
			if(!setName || !setName.length) {
				setName = searchTerm;
				var filterArray = [];
				for(var f in filters) {
					if(!!filters[f]) {
						filterArray.push(f);
					}
				}

				$log.info('SET', "filters for name making", filters);
				for (var i = 0;i<filterArray.length;i++) {
					$log.info('SET', "filters for name making", filterArray[i]);
					setName += " " + filterArray[i];
				}
			}

			$http({
				url: "../api/",
				method: 'POST',
				params: {"query": 'createset'},
				data: {"name": setName, "products": setProductIds}
			})
				.success(function(status) {
					if(!status.success) {dfd.reject(status.error);}
					if(!!status.success) {dfd.resolve(status.message);}
				})
				.error(function(err) {
					dfd.reject(err);
				});

			return dfd.promise;

		}

		function _getSets(hash) {
			var dfd = $q.defer();
			var hash = hash || false;
			var params = {"query": 'getsetdata'};

			if(!!hash) {
				params.hash = hash;
			}


			$http({
				url: "../api/",
				method: "get",
				params: params
			})
				.success(function(data) {
					if(!data.success) {
						dfd.reject(data.error);
					}

					if(!!data.success) {
						dfd.resolve(data.data);
					}
				})
				.error(function(reason) {
					dfd.reject(reason);
				});

			return dfd.promise;
		}

		return {
			makeSet: _makeSet,
			getSets: _getSets
		};

	});