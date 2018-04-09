var app = angular.module('Holistic.MainControllers');

app.controller('ConsultantCtrl', function ($scope, $state, $localStorage, $rootScope, GameService, BarcodeService) {

    if (ionic.Platform.isAndroid())
        $scope.isAndroid = true;
    else
        $scope.isAndroid = false;

    $scope.onGetDepartment = function (departmentParam) {
        $state.go('app.research', { department: departmentParam });
    };

    $scope.selectDepartmentForResearch = function () {

        if (ionic.Platform.is('browser') || window.device.isVirtual) {
            GameService.getDepartment($localStorage.get("departmentBarcode")).then(function (departmentData) {
                $scope.onGetDepartment(departmentData);
            });
        } else {
            BarcodeService.scan(function (result) {
                if (result != 'undefined' && result.length !== 0 && !result.cancelled) {
                    GameService.getDepartment(result.text).then(function (departmentData) {
                        $scope.onGetDepartment(departmentData);
                    });
                }
            });
        }
    };

    $scope.getStrategyInfo = function() {
        BarcodeService.scan(function (result) {
            if (result != 'undefined' && result.length !== 0 && !result.cancelled) {
                GameService.getStrategyWithDependencies(result.text).then(function (message) {
                    $state.go('app.singleStrategy', { strategyCard: message.strategy[0], enableActions: false,
                         internalDependencies: message.internalDependencies, externalDependencies: message.externalDependencies });
                });
            }
        });
    };

    $scope.$on('$ionicView.enter', function () {
        $rootScope.hide_mail_icon = true;
    });
});

app.controller('DistributeResourcesCtrl', function ($scope, PubSubService, GameService) {

    $scope.consultantActions = [];

    PubSubService.subscribe("consultantActions", function (data) {
        var newActions = [];

        data.resources.forEach(function (resourceElement, index) {
            newActions.push(resourceElement);
            data.actions.forEach(function (actionElement, index) {
                if (resourceElement.company === actionElement.company) {
                    newActions.push(actionElement);
                }
            });
        });

        $scope.$apply(function () {
            $scope.consultantActions = newActions;
        });
    });
    $scope.deleteActions = function(index){
         GameService.updateConsultantToDo($scope.consultantActions[index].id);
    };

    $scope.$on('$ionicView.unloaded', function () {
        PubSubService.unsubscribe("consultantActions");
    });
});

app.controller('ResearchCtrl', function ($scope, $stateParams, $ionicPopup, $ionicModal, $translate, GameService) {

    $scope.department = $stateParams.department;
    //Research topic data has properties for already researched and if the department is able to buy them.
    $scope.researchTopics = null;
    var currentTopic = null;
    var rolledValue = 0;

    $ionicModal.fromTemplateUrl('researchModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.research = function (topic) {
        if (topic.finished === 'true') {
            var popup = $ionicPopup.alert({
                title: $translate.instant("alreadyResearched"),
                okType: 'button-clear button-positive'
            });
        } else if (topic.enoughMoneyToResearch === 'false') {
            var popup = $ionicPopup.alert({
                title: $translate.instant("notEnoughMoney"),
                okType: 'button-clear button-positive'
            });
        } else {
            currentTopic = topic;
            $scope.modal.show();
        }
    };

    /**
     * Receive all available research topic from server.
     * These have properties for already researched and if the department is able to buy them.
     */
    var getTopics = function () {
        GameService.getResearchTopics($scope.department.companyId, $scope.department.id).then(function (researchTopicsParam) {
            $scope.researchTopics = researchTopicsParam;
        });
    }

    /**
     * Roll for the user.
     */
    $scope.roll = function () {
        rolledValue = Math.floor((Math.random() * 20) + 1);
        GameService.research($scope.department.companyId, $scope.department.id, currentTopic.id, rolledValue);
        $scope.modal.hide();
        getTopics();
    }

    $scope.researchSuccessful = function () {
        //Pass complexity of topic -> will always be successful
        GameService.research($scope.department.companyId, $scope.department.id, currentTopic.id, parseInt(currentTopic.complexity));
        $scope.modal.hide();
        getTopics();
    }

    $scope.researchNotSuccessful = function () {
        //Pass -1 -> will always be unsuccessful
        GameService.research($scope.department.companyId, $scope.department.id, currentTopic.id, -1);
        $scope.modal.hide();
        getTopics();
    }

    $scope.$on('$ionicView.enter', function () {
        getTopics();
    });
});
