/**
 * Created by vivaldi on 15.1.2014.
 */

angular.module('Deep.Services')
	.factory('$set', function($http, $q, $log) {


		function _uniqueId(){
			// always start with a letter (for DOM friendlyness)
			var idstr=String.fromCharCode(Math.floor((Math.random()*25)+65));
			do {
				// between numbers and characters (48 is 0 and 90 is Z (42-48 = 90)
				var ascicode=Math.floor((Math.random()*42)+48);
				if (ascicode<58 || ascicode>64){
					// exclude all chars between : (58) and @ (64)
					idstr+=String.fromCharCode(ascicode);
				}
			} while (idstr.length<32);

			return (idstr);
		}

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

		function _getSets() {
			var dfd = $q.defer();

			$http({
				url: "../api/",
				method: "get",
				params: {"query": 'getallsets'}
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