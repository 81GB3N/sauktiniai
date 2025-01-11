'use strict';
angular.module("ngLocale", [], ["$provide", function($provide) {
var PLURAL_CATEGORY = {ZERO: "zero", ONE: "one", TWO: "two", FEW: "few", MANY: "many", OTHER: "other"};
function getDecimals(n) {
  n = n + '';
  var i = n.indexOf('.');
  return (i == -1) ? 0 : n.length - i - 1;
}

function getVF(n, opt_precision) {
  var v = opt_precision;

  if (undefined === v) {
    v = Math.min(getDecimals(n), 3);
  }

  var base = Math.pow(10, v);
  var f = ((n * base) | 0) % base;
  return {v: v, f: f};
}

$provide.value("$locale", {
  "DATETIME_FORMATS": {
    "AMPMS": [
      "prie\u0161piet",
      "popiet"
    ],
    "DAY": [
      "sekmadienis",
      "pirmadienis",
      "antradienis",
      "tre\u010diadienis",
      "ketvirtadienis",
      "penktadienis",
      "\u0161e\u0161tadienis"
    ],
    "ERANAMES": [
      "prie\u0161 Krist\u0173",
      "po Kristaus"
    ],
    "ERAS": [
      "pr. Kr.",
      "po Kr."
    ],
    "FIRSTDAYOFWEEK": 0,
    "MONTH": [
      "sausio",
      "vasario",
      "kovo",
      "baland\u017eio",
      "gegu\u017e\u0117s",
      "bir\u017eelio",
      "liepos",
      "rugpj\u016b\u010dio",
      "rugs\u0117jo",
      "spalio",
      "lapkri\u010dio",
      "gruod\u017eio"
    ],
    "SHORTDAY": [
      "sk",
      "pr",
      "an",
      "tr",
      "kt",
      "pn",
      "\u0161t"
    ],
    "SHORTMONTH": [
      "saus.",
      "vas.",
      "kov.",
      "bal.",
      "geg.",
      "bir\u017e.",
      "liep.",
      "rugp.",
      "rugs.",
      "spal.",
      "lapkr.",
      "gruod."
    ],
    "STANDALONEMONTH": [
      "sausis",
      "vasaris",
      "kovas",
      "balandis",
      "gegu\u017e\u0117",
      "bir\u017eelis",
      "liepa",
      "rugpj\u016btis",
      "rugs\u0117jis",
      "spalis",
      "lapkritis",
      "gruodis"
    ],
    "WEEKENDRANGE": [
      5,
      6
    ],
    "fullDate": "y 'm'. MMMM d 'd'., EEEE",
    "longDate": "y 'm'. MMMM d 'd'.",
    "medium": "y-MM-dd HH:mm:ss",
    "mediumDate": "y-MM-dd",
    "mediumTime": "HH:mm:ss",
    "short": "y-MM-dd HH:mm",
    "shortDate": "y-MM-dd",
    "shortTime": "HH:mm"
  },
  "NUMBER_FORMATS": {
    "CURRENCY_SYM": "\u20ac",
    "DECIMAL_SEP": ",",
    "GROUP_SEP": "\u00a0",
    "PATTERNS": [
      {
        "gSize": 3,
        "lgSize": 3,
        "maxFrac": 3,
        "minFrac": 0,
        "minInt": 1,
        "negPre": "-",
        "negSuf": "",
        "posPre": "",
        "posSuf": ""
      },
      {
        "gSize": 3,
        "lgSize": 3,
        "maxFrac": 2,
        "minFrac": 2,
        "minInt": 1,
        "negPre": "-",
        "negSuf": "\u00a0\u00a4",
        "posPre": "",
        "posSuf": "\u00a0\u00a4"
      }
    ]
  },
  "id": "lt-lt",
  "localeID": "lt_LT",
  "pluralCat": function(n, opt_precision) {  var vf = getVF(n, opt_precision);  if (n % 10 == 1 && (n % 100 < 11 || n % 100 > 19)) {    return PLURAL_CATEGORY.ONE;  }  if (n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 11 || n % 100 > 19)) {    return PLURAL_CATEGORY.FEW;  }  if (vf.f != 0) {    return PLURAL_CATEGORY.MANY;  }  return PLURAL_CATEGORY.OTHER;}
});
}]);


var kamApp = angular.module('kamApp', ['ngRoute','ngSanitize', 'ui.bootstrap', 'ngMessages', 'ajoslin.promise-tracker', 'bgf.paginateAnything', 'vcRecaptcha'])
.config(['$routeProvider', function($routeProvider){
	$routeProvider
	.when('/list/:region', {
		templateUrl: 'tpl_list.html',
		controller: 'ListByRegion',
		resolve: {
            contactsLoaded: function($rootScope){
                return $rootScope.loadContacts();
            }
        }
	});
}])
.config(['uibDatepickerConfig', function(uibDatepickerConfig) {
	var d = new Date();
	uibDatepickerConfig.showWeeks = false;
	uibDatepickerConfig.startingDay = 1;
	uibDatepickerConfig.formatDay = "dd";
	uibDatepickerConfig.formatMonth = "MM";
	uibDatepickerConfig.formatYear = "yyyy";
	uibDatepickerConfig.datepickerMode = 'year';
//	uibDatepickerConfig.minDate = (d.getFullYear()-40)+'-01-01';
//	uibDatepickerConfig.maxDate = (d.getFullYear()-16)+'-12-31';
}])
.config(['uibDatepickerPopupConfig', function(uibDatepickerPopupConfig) {
	uibDatepickerPopupConfig.showButtonBar = false;
}])
.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}])
.run(['$rootScope', '$route', '$http', function($rootScope, $route, $http) {
	$rootScope.tr = {
		err_numbers_only: "Įvesti galima tik skaičius",
		err_to_short: "Vertė per trumpa",
		err_to_long: "Vertė per ilga",
		error_network: "Įvyko tinklo klaida! Bandykite vėliau.",
		err_required: "Laukas privalomas",
		err_date_format: "Datos formatas: MMMM-mm-dd"
	};
	$rootScope.regions = {};
	$rootScope.departments = {};
	$rootScope.contactsLoaded = false;
	var prom;
	var version = '2';
	
	$rootScope.loadContacts = function(){
		if($rootScope.contactsLoaded){
			return $rootScope.contactsLoaded;
		}
		else{
			if(!prom){
				prom = $http({
					method: 'GET',
					url: `js/info.json?version=v${version}`,
				}).
				then(function(response) {
					$rootScope.regions = response.data.regions;
					$rootScope.departments = response.data.departments;
					$rootScope.contactsLoaded = true;
					return $rootScope.contactsLoaded;
				});
			}
			return prom;
		}
	};
	$rootScope.loadContacts();
	
	$rootScope.getDepartmentParam = function(department_id, param){
		if(angular.isDefined($rootScope.departments[parseInt(department_id)])){
			return $rootScope.departments[parseInt(department_id)][param];
		}
		return '';
	};
	$rootScope.ud = {};
	
	// BEFORE 1.3:
 	//$http.get('data/data.json').success(function(data){
 	//	$rootScope.ud = data;
 	//});
	
	// AFTER 1.6:
	$http({
		method: 'GET',
		url: 'data/data.json',
	}).
	then(function onSuccess(response) {
		var data = response.data;
		$rootScope.ud = data;
	});
		
	$rootScope.$on('$routeChangeSuccess', function(newVal, oldVal) {
		if (oldVal !== newVal){
			for(var i in $rootScope.regions){
				$rootScope.regions[i].active = false;
			}
			if(angular.isDefined($route.current) && angular.isDefined($route.current.params.region)){
				$rootScope.regions[$route.current.params.region].active = true;
			}
		}
	});
	$rootScope.mobile = (window.innerWidth <900) || (navigator.userAgent.indexOf('Mobile') > -1);
	$rootScope.getRegionByDepartment = function(department_id, param){
		var reg = $rootScope.departments[parseInt(department_id)].region;
		return $rootScope.regions[reg][param];
	};
}]);

kamApp.directive('resultsTable', function(){
	return {
		restrict: 'EA',
		scope: {
			list: '='
		},
		templateUrl: 'tpl_results_table.html',
		controller: function($scope, $rootScope){
			$scope.getDepartmentParam = function(department_id, param){
				return $rootScope.getDepartmentParam(department_id, param);
			};
			$scope.getRegionByDepartment = function(department_id, param){
				return $rootScope.getRegionByDepartment(department_id, param);
			};
		}
	};
});

kamApp.controller('ListByRegion', ['$scope', '$rootScope', '$route', '$http', function($scope, $rootScope, $route, $http){
	$scope.region = $rootScope.regions[$route.current.params.region];
	$scope.region_info_url = 'dsc.php';
	$scope.url_params = {
		region: $scope.region.nr
	};
	if(!$scope.region.loaded){
		
		// BEFORE 1.3
		/*
		$http({
			method: 'GET',
			url: $scope.region_info_url,
			params: {
				region: $scope.region.id
			}
		})
		.success(function(data, status, headers, config) {
			$scope.region.loaded = true;
			if(angular.isDefined(data.description)){
				$scope.region.description = data.description;
			}
		});
		*/
	   
	   // AFTER 1.6:
		$http({
			method: 'GET',
			url: $scope.region_info_url,
			params: {
				region: $scope.region.id
			}
		}).
		then(function onSuccess(response) {
			var data = response.data;
			$scope.region.loaded = true;
			if(angular.isDefined(data.description)){
				$scope.region.description = data.description;
			}
		});
		
	}
	
	$scope.url_reload = true;
	$scope.items_per_page = 100;
	$scope.starting_page = 0;
	$scope.list_url = 'list.php';
	$scope.list = [];
	if ($rootScope.mobile){
		scrollToList();
	}
	
	$scope.$on('pagination:loadStart', function () {
		$rootScope.show_loader = true;
	});
	$scope.$on('pagination:loadPage', function () {
		$rootScope.show_loader = false;
	});
}]);


kamApp.controller('SearchByCredentials', ['$scope', '$http', '$log', '$rootScope', '$filter', 'promiseTracker', 'vcRecaptchaService', 'uibDateParser', function($scope, $http, $log, $rootScope, $filter, promiseTracker, vcRecaptchaService, uibDateParser){
	$scope.search_url = 'search.php';
	$scope.fdata = {
		name: '',
		lastname: '',
		code: '',
		bdate: null
	};
	$scope.default_fdata = angular.copy($scope.fdata);
	$scope.submitted = false;
	$scope.response_success = false;
	$scope.showlists = false;
	$scope.calopened = false;
	$scope.dpmode = 'year';
	$scope.response = {};
	$scope.grkey = '6LcAnIMUAAAAAInNK23sbfnbnhUrc-0G-mF-Gkte';
	$scope.grresponse='';
	$scope.grwid;
	$scope.submit = function(){
		//$scope.submitted = true;
		
		// BEFORE ANGULAR 1.3:
		/*
		var $promise = $http.jsonp($scope.search_url, {
			params : {
				name: $scope.fdata.name,
				lastname: $scope.fdata.lastname,
				code: $scope.fdata.code,
				bdate: $filter('date')($scope.fdata.bdate, 'yyyy-MM-dd'),
				callback: 'JSON_CALLBACK',
				grresponse: $scope.grresponse
			}
		})
		.success(function(data, status, headers, config){
			$scope.submitted = true;
			if(data.success){
				$scope.response = data.data;
				if ($scope.response.found){
					$scope.response.list = [];
					if (angular.isDefined($scope.response.list_before)){
						$scope.response.list = $scope.response.list_before;
					}
					$scope.response.info.marked=true;
					$scope.response.list.push($scope.response.info);
					if (angular.isDefined($scope.response.list_after)){
						for (var i=0;i<$scope.response.list_after.length;i++){
							$scope.response.list.push($scope.response.list_after[i]);
						}
					}
				}
				$scope.response_success = true;
			}
			else{
				$scope.messages = data.message;
			}
			
		})
		.error(function(data, status, headers, config) {
			$scope.submitted = true;
			$scope.progress = data;
			$scope.messages = $rootScope.tr.error_network;
			$log.error(data);
		});
*/
		
		// AFTER ANGULAR 1.6:
		var params = {
			name: $scope.fdata.name,
			lastname: $scope.fdata.lastname,
			code: $scope.fdata.code,
			bdate: $filter('date')($scope.fdata.bdate, 'yyyy-MM-dd'),
			jsonpCallbackParam :'callback',
			grresponse: $scope.grresponse
		}
		var $promise = $http.jsonp($scope.search_url, {params: params}).then(function(data, status, headers, config){
			var data = data.data;
			$scope.submitted = true;
			if(data.success){
				$scope.response = data.data;
				if ($scope.response.found){
					$scope.response.list = [];
					if (angular.isDefined($scope.response.list_before)){
						$scope.response.list = $scope.response.list_before;
					}
					$scope.response.info.marked=true;
					$scope.response.list.push($scope.response.info);
					if (angular.isDefined($scope.response.list_after)){
						for (var i=0;i<$scope.response.list_after.length;i++){
							$scope.response.list.push($scope.response.list_after[i]);
						}
					}
				}
				$scope.response_success = true;
			}
			else{
				$scope.messages = data.message;
			}
			$scope.resetFormScrollToRez();
			
		}, function(data, status, headers, config){
			$scope.submitted = true;
			$scope.progress = data;
			$scope.messages = $rootScope.tr.error_network;
			$log.error(data);
		});
		
		$scope.progress.addPromise($promise);
	};
	$scope.progress = promiseTracker();
	$scope.resetSubmit = function(){
		if($scope.response_success){
			$scope.resetForm();
		}
		$scope.submitted = false;
		$scope.response_success = false;
		$scope.response = {};
		$scope.messages = null;
		$scope.showlists = false;
	};
	$scope.resetForm = function(){
		vcRecaptchaService.reload($scope.grwid);
		$scope.grresponse = '';
		$scope.searchform.$rollbackViewValue();
		$scope.fdata = angular.copy($scope.default_fdata);
		$scope.searchform.$setPristine();
		scrollToResults();
	};
	$scope.resetFormScrollToRez = function(){
		vcRecaptchaService.reload($scope.grwid);
		$scope.grresponse = '';
		$scope.searchform.$rollbackViewValue();
		$scope.fdata = angular.copy($scope.default_fdata);
		$scope.searchform.$setPristine();
		var target = document.getElementById("header");
		animate(document.scrollingElement || document.documentElement, "scrollTop", "", 0, target.clientHeight, 500, true);
	};
	$scope.toogleLists = function(){
		$scope.showlists = !$scope.showlists;
		if (!$scope.showlists){
			scrollToResults();
		}
	};
	$scope.getRegion = function(rid){
		var reg = '';
		for(var i in $rootScope.regions){
			if($rootScope.regions[i].nr == rid){
				reg = $rootScope.regions[i].title;
				break;
			}
		}
		return reg;
	};
	$rootScope.$watch($scope.progress.active, function (isActive) {
		$rootScope.show_loader = isActive;
	});
	
	$scope.openCal = function($event) {
		if(!$scope.fdata.bdate){
			$scope.dpmode = 'year';
			var d = new Date();
			d.setFullYear(d.getFullYear()-19);
			$scope.fdata.bdate = uibDateParser.parse(d, 'yyyy-MM-dd');//$filter('date')(d, 'yyyy-MM-dd');
		}
		$event.preventDefault();
		$event.stopPropagation();
		$scope.calopened = true;
	};
	
	$scope.setGrResponse = function(response){
		$scope.grresponse = response;
	};
	$scope.setGrWidgetId = function(widgetid){
		$scope.grwid = widgetid;
	};
	$scope.getDepartmentsByReg = function(region){
		var departments = [];
//		$log.debug(region);
		for(var i in $rootScope.departments){
			if($rootScope.departments[i].regionnr == region){
				departments.push($rootScope.departments[i]);
			}
		}
		return departments;
//		return $filter('filter')($rootScope.departments, {region: region});
	};
}]);

function scrollToList(){
	window.scrollTo(0,(document.getElementById('scrolltothis').offsetTop-20));
};
function scrollToResults(){
	window.scrollTo(0,(document.getElementById('scrolltoresults').offsetTop-20));
};

function animate(elem, style, unit, from, to, time, prop) {
    if (!elem) {
        return;
    }
    var start = new Date().getTime(),
        timer = setInterval(function () {
            var step = Math.min(1, (new Date().getTime() - start) / time);
            if (prop) {
                elem[style] = (from + step * (to - from))+unit;
            } else {
                elem.style[style] = (from + step * (to - from))+unit;
            }
            if (step === 1) {
                clearInterval(timer);
            }
        }, 25);
    if (prop) {
          elem[style] = from+unit;
    } else {
          elem.style[style] = from+unit;
    }
}