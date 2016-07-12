/**
 * angular-dialog - Dialog boxes for angular
 * @version v1.0.0
 * @author Delphin Germa, 
 * @license MIT, http://www.opensource.org/licenses/MIT
 */
(function(){
'use strict';
/**
 * @ngdoc overview
 * @name spacesimperiumApp
 * @description # spacesimperiumApp
 * 
 * Main module of the application.
 */
(function() {

	var module = angular.module('DialogsModule', [ 'ui.bootstrap' ], [
			'$compileProvider', function($compileProvider) {
				$compileProvider.directive('compile', ['$compile', function($compile) {
					// directive factory creates a link function
					return function(scope, element, attrs) {
						scope.$watch(function(scope) {
							// watch the 'compile' expression for changes
							return scope.$eval(attrs.compile);
						}, function(value) {
							// when the 'compile' expression changes
							// assign it into the current DOM
							element.html(value);

							// compile the new DOM and link it to the current
							// scope.
							// NOTE: we only compile .childNodes so that
							// we don't get into infinite loop compiling
							// ourselves
							$compile(element.contents())(scope);
						});
					};
				}]);
			} ]);

	module
			.provider(
					'dialogConfig',
					function () {
						var lTextButtonClose = "Close";
						var lTemplate = '';

						this.setTextButtonClose = function(pValue) {
							lTextButtonClose = pValue;
						};
						this.setTemplate = function(pValue) {
							lTemplate = pValue;
						};

						this.$get = [ function() {
							return {
								textButtonClose : lTextButtonClose,
								template : lTemplate
							};
						} ];
					});

})();
/**
 * @ngdoc service
 * @name rest.user
 * @description # user Service in the spacesimperiumApp.
 */
angular.module('DialogsModule').controller('DialogCtrl', [ '$scope', function User($scope) {
	
	$scope.close = function () {
		$scope.modal.dismiss();
	};

	$scope.__proto__.api = $scope;
} ]);

/**
 * @ngdoc service
 * @name rest.user
 * @description # user Service in the spacesimperiumApp.
 */
angular.module('DialogsModule').service('Dialog', [ '$rootScope', '$modal', 'dialogConfig', function User($rootScope, $modal, dialogConfig) {
	
	//Generate default buttons to close popup
	var generateDefaultButtons = function () {
		return [{
			title : dialogConfig.textButtonClose,
			onValid : true,
			onDissmiss : true,
			action : function (pScope) {
				pScope.close();
			}
		}];
	};
	
	var internal = function (opts) {
		
		//Extract options
		var lTitle = opts.title || "";
		var lTextContent = opts.textContent || "";
		var lHtmlContent = opts.htmlContent || "";
		var lButtons = opts.buttons || generateDefaultButtons();
		var lTemplate = opts.template || dialogConfig.template;
		var lSubScope = opts.scope || {};
		
		lButtons = lButtons.reverse();
		//Create scope
		var lScope = $rootScope.$new(true);
		
		//Create modal
		var lModal = $modal.open({
			templateUrl : 'bower_components/angular-dialog/views/template.html',
			controller : 'DialogCtrl',
			scope : lScope
		});
		
		//Add modal to scope
		lScope.modal = lModal;

		//Add datas to scope
		lScope.title = lTitle;
		lScope.textContent = lTextContent;
		lScope.htmlContent = lHtmlContent;
		lScope.buttons = lButtons;
		
		for (var lAttr in lSubScope) {
			lScope[lAttr] = lSubScope[lAttr];
		}
		
		lModal.result.then(function () {
			resolve(true);
		}, function (pKey) {
			angular.forEach(lScope.buttons, function (element) {
				if (pKey == 'backdrop click' && element.onValid && element.action) {
					element.action(lScope.api);
				} else if (pKey == 'escape key press' && element.onDissmiss && element.action) {
					element.action(lScope.api);
				}
			});
		});
		
		return lScope;
	};
	
	this.alert = function (pTitle, pMessage) {
		return new Promise(function (resolve, reject) {
			internal({
				title : pTitle,
				textContent : pMessage,
				buttons : [{
					title : dialogConfig.textButtonClose,
					onValid : true,
					onDissmiss : true,
					action : function (pScope) {
						pScope.close();
						resolve(true);
					}
				}]
			});
		});
	};
	
	this.confirm = function (pTitle, pMessage) {
		return new Promise(function (resolve, reject) {
			internal({
				title : pTitle,
				textContent : pMessage,
				buttons : [{
					title : 'Ok',
					onValid : true,
					action : function (pScope) {
						pScope.close();
						resolve(true);
					}
				}, {
					title : 'Cancel',
					onDissmiss : true,
					action : function (pScope) {
						pScope.close();
						reject(false);
					}
				}]
			});
		});
	};
	
	this.prompt = function (pTitle, pMessage, pPlaceholder, pDefaultValue) {
		var lContent = '<span translate>{{question|translate}}</span> : <input type="text" ng-model="value" placeholder="{{placeholder|translate}}" />';
		return new Promise(function (resolve, reject) {
			internal({
				title : pTitle,
				htmlContent : lContent,
				scope : {
					question : pMessage,
					value : pDefaultValue || "",
					placeholder : pPlaceholder
				},
				buttons : [{
					title : 'Ok',
					onValid : true,
					action : function (pScope) {
						pScope.close();
						resolve(pScope.value);
					}
				}, {
					title : 'Cancel',
					onDissmiss : true,
					action : function (pScope) {
						pScope.close();
						reject(false);
					}
				}]
			});
		});
	};
	
	this.dialog = function (opts) {
		return internal(opts);
	}
} ]);

angular.module("DialogsModule").run(["$templateCache", function ($templateCache) {
	$templateCache.put("bower_components/angular-dialog/views/template.html", "<fieldset><legend translate>{{title}}</legend><div translate>{{textContent}}</div><div compile=\"htmlContent\"></div><span ng-repeat=\"button in buttons\" ng-click=\"button.action(api)\" translate class=\"btn btn-primary pull-right\">{{button.title}}</span></fieldset>");
}]);
})();