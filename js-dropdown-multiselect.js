'use strict';

var directiveModule = angular.module('angularjs-dropdown-multiselect', []);

directiveModule.run(['$templateCache', function($templateCache)
{
	var template = '<div class="multiselect-parent btn-group dropdown-multiselect" data-ng-class="{open: open}">';
	template +='<button type="button" class="btn btn-default dropdown-toggle" data-ng-click="open=!open;">{{getButtonText()}}<span class="caret"></span></button>';
	template += '<ul class="dropdown-menu">';
	template += '<li><a data-ng-click="selectAll()"><span class="glyphicon glyphicon-ok"></span>  Check All</a>';
	template += '<li><a data-ng-click="deselectAll();"><span class="glyphicon glyphicon-remove"></span>  Uncheck All</a></li>';
	template += '<li class="divider"></li>';
	template += '<li data-ng-repeat="option in options"><a data-ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp))"><span data-ng-class="isChecked(getPropertyForObject(option,settings.idProp))"></span>{{getPropertyForObject(option, settings.displayProp)}}</a></li>';
	template += '</ul>';
	template += '</div>';

	$templateCache.put('dropdown-multiselect-template.html', template);
}]);

directiveModule.directive('ngDropdownMultiselect', ['$filter', '$document', function ($filter, $document) {

	return {
		restrict: 'AE',
		scope:{
			selectedModel: '=',
			options: '=',
			extraSettings: '='
		},
		templateUrl: 'dropdown-multiselect-template.html',
		link: function($scope, $element){
			$scope.settings = {
				dynamicTitle: true,
				defaultText: 'Select',
				closeOnBlur: true,
				displayProp: 'label',
				idProp: 'id',
				externalIdProp: 'id'};

			angular.extend($scope.settings, $scope.extraSettings || []);

			if ($scope.settings.closeOnBlur) {
				$document.on('click', function (e) {
					var target = e.target.parentElement;
					var parentFound = false;

					while (angular.isDefined(target) && target != null && !parentFound) {
						if (_.contains(target.classList, 'multiselect-parent') && !parentFound) {
							parentFound = true;
						}
						target = target.parentElement;
					}

					if (!parentFound) {
						$scope.$apply(function () {
							$scope.open = false;
						});
					}
				});
			}

			$scope.getButtonText = function()
			{
				if ($scope.settings.dynamicTitle)
				{
					var totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;

					if (totalSelected === 0)
					{
						return $scope.settings.defaultText;
					}
					else
					{
						return totalSelected + ' selected';
					}
				}
				else
				{
					return $scope.settings.defaultText;
				}
			}


			$scope.getPropertyForObject = function(object, property)
			{
				if (object.hasOwnProperty(property)) {
					return object[property];
				}

				return '';
			};

			$scope.selectAll = function () {
				$scope.deselectAll();

				angular.forEach($scope.options, function(value)
				{
					$scope.setSelectedItem(value[$scope.settings.idProp]);
				});
			};

			$scope.deselectAll = function() {
				$scope.selectedModel=[];
			};

			$scope.setSelectedItem = function(id, forceAdd){
				forceAdd = forceAdd || false;
				var findObj = {};
				findObj[$scope.settings.externalIdProp] = id;

				if (!forceAdd && _.findIndex($scope.selectedModel, findObj) !== -1) {
					$scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
				} else {
					$scope.selectedModel.push(findObj);
				}

				return false;
			};

			$scope.isChecked = function (id) {
				var findObj = {};
				findObj[$scope.settings.externalIdProp] = id;

				if (_.findIndex($scope.selectedModel, findObj) !== -1) {
					return 'glyphicon glyphicon-ok';
				}
				return '';
			};
		}
	};
}]);