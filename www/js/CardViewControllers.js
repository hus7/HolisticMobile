var app = angular.module('Holistic.MainControllers');

app.controller('StrategiesCtrl', function ($scope, $state, $stateParams, $ionicTabsDelegate, $translate, PubSubService, Analytics) {

    Analytics.trackView("Strategies Overview Screen");

    $scope.strategyCards = [];
    $scope.onlyActiveAndNotActive = $stateParams.onlyActiveAndNotActive;
    //Pie chart options: See nvd3 documentation for settings.
    $scope.options = {
        chart: {
            type: 'pieChart',
            height: 400,
            x: function(d){return d.key;},
            y: function(d){return d.y;},
            valueFormat:d3.format('.0f'),
            showLabels: true,
            labelType: "value",
            duration: 500,
            labelThreshold: 0.01,
            labelSunbeamLayout: true,
            legend: {
                margin: {
                    top: 5,
                    right: 35,
                    bottom: 5,
                    left: 0
                }
            }
        }
    };

    var resetData = function(){
        //Set default data for pie chart
        $scope.data = [
            {
                key: $translate.instant('bought'),
                y: 0,
                color: d3.rgb("#4A494A")
            },
            {
                key: $translate.instant('implemented'),
                y: 0,
                color: d3.rgb("#D7D900")
            },
            {
                key: $translate.instant('active'),
                y: 0,
                color: d3.rgb("#00C601")
            },
            {
                key: $translate.instant('notActive'),
                y: 0,
                color: d3.rgb("#E50008")
            }
        ];
    };

    PubSubService.subscribe("strategyCards", function (strategyCards) {
        $scope.$apply(function () {
            $scope.strategyCards = strategyCards;
            if( $ionicTabsDelegate.selectedIndex() == 0 ){
                $scope.updateTab();
            }
        });
    });

    $scope.updateTab = function() {
        //Update data on tab select because if this is done while tab is not active the chart will not be displayed correctly if afterwards selected.
        //-> Size of tab is not correct.
        resetData();
        //Summarize
        $scope.strategyCards.forEach( function(card) {
            switch(card.state){
                case 'BOUGHT':
                    Analytics.trackView("View Bought Strategies Screen");
                    $scope.data[0].y += 1;
                    break;
                case 'IMPLEMENTED':
                    Analytics.trackView("View Implemented Strategies Screen");
                    $scope.data[1].y += 1;
                    break;
                case 'ACTIVE':
                    Analytics.trackView("View Active Strategies Screen");
                    $scope.data[2].y += 1;
                    break;
                case 'NOT_ACTIVE':
                    Analytics.trackView("View Not Active Strategies Screen");
                    $scope.data[3].y += 1;
                    break;
                default:
                    break;
            }
        });
    }

    $scope.showCard = function (strategyCard) {
        $state.go('app.singleStrategy', { strategyCard: strategyCard, enableActions: $stateParams.enableActions });
    };

    $scope.$on('$ionicView.unloaded', function () {
        PubSubService.unsubscribe("strategyCards");
    });
});

app.controller('SingleStrategyCtrl', function ($scope, $stateParams, $ionicHistory, CardService, Analytics) {

    Analytics.trackView("Single Strategy Details Screen");

    if (ionic.Platform.isAndroid())
        $scope.isAndroid = true;
    else
        $scope.isAndroid = false;

    //If actions should be enabled or not.
    $scope.implementCard = function () {
        CardService.implementStrategy($scope.strategyCard.id);
        $ionicHistory.goBack();
    };
    $scope.sellStrategy = function () {
        CardService.sellStrategy($scope.strategyCard.id);
        $ionicHistory.goBack();
    };
    $scope.deplementCard = function () {
        CardService.deplementStrategy($scope.strategyCard.id);
        $ionicHistory.goBack();
    };

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.strategyCard = $stateParams.strategyCard;
        $scope.enableActions = $stateParams.enableActions;
        if( $stateParams.internalDependencies !== null ){
            $scope.internalGroups = $stateParams.internalDependencies.slice(0,1)[0];
            $scope.internalDependencies = $stateParams.internalDependencies.slice(1,$stateParams.internalDependencies.length);
            // (/-[^-]+$", "-??/);
            // (/-[^-]+-[^-]+$/, "-??-??");
        }

        if( $stateParams.externalDependencies !== null ){
            $scope.externalGroups = $stateParams.externalDependencies.slice(0,1)[0];
            $scope.externalDependencies = $stateParams.externalDependencies.slice(1,$stateParams.externalDependencies.length);
        }
    });
});

app.controller('BoughtStrategiesCtrl', function ($scope, $rootScope, GameService, Analytics) {

    Analytics.trackView("Pickup New Cards Screen");

    $scope.$on('$ionicView.enter', function () {
        // $rootScope.pickupNewCards = 0;
        // GameService.getNewBoughtStrategies().then(function (newBoughtStrategies) {
        //     $scope.strategies = newBoughtStrategies;
        // });
    });
    $scope.updateStrategies = function (index) {
       $scope.newBoughtStrategies.splice(index, 1);
       $rootScope.pickupNewCards--;
    };
});

app.controller('CompetencesCtrl', function ($scope, $state, PubSubService, Analytics) {

    Analytics.trackView("Competence Overview Screen");

    $scope.ecologicProgressPercent = 0;
    $scope.economicProgressPercent = 0;
    $scope.networkProgressPercent = 0;

    $scope.competenceCards = [];
    $scope.summedEcologicCompetence = 0;
    $scope.summedEconomicCompetence = 0;
    $scope.summedNetworkCompetence = 0;


    PubSubService.subscribe("competenceCards", function (competenceCards) {

        // $scope.summedEcologicCompetence = 0;
        // $scope.summedEconomicCompetence = 0;
        // $scope.summedNetworkCompetence = 0;

        $scope.$apply(function () {
            $scope.competenceCards = competenceCards;

            //Sum up competences
            competenceCards.forEach(function (element) {
                $scope.summedEcologicCompetence += parseFloat(element.ecology);
                $scope.ecologicProgressPercent = ($scope.summedEcologicCompetence * 9) / 100;

                $scope.summedEconomicCompetence += parseFloat(element.economy);
                $scope.economicProgressPercent = ($scope.summedEconomicCompetence * 9) / 100;

                $scope.summedNetworkCompetence += parseFloat(element.networking);
                $scope.networkProgressPercent = ($scope.summedNetworkCompetence * 9) / 100;
            }, this);
        });
    });

    $scope.showCompetenceCard = function (card) {
        $state.go('app.singleCompetence', { competenceCard: card });
    };

    $scope.$on('$ionicView.unloaded', function () {
        PubSubService.unsubscribe("competenceCards");
    });

});
app.controller('SingleCompetenceCtrl', function ($scope, $stateParams, $ionicHistory, CardService, Analytics) {

    Analytics.trackView("Single Competence Details Screen");

    if (ionic.Platform.isAndroid())
      $scope.isAndroid = true;
    else
      $scope.isAndroid = false;
    //The competence card to show.
    $scope.competenceCard = $stateParams.competenceCard;

    $scope.sellCompetence = function () {
        CardService.sellCompetence($scope.competenceCard.id);
        $ionicHistory.goBack();
    };

    $scope.$on('$ionicView.enter', function () {
        $scope.$apply(function () {
            $scope.competenceCard = $stateParams.competenceCard;
        });
    });
});
