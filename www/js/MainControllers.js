var app = angular.module('Holistic.MainControllers', ['Holistic.WebSocketService', 'Holistic.UtilityServices',
'Holistic.PubSubService', 'Holistic.GameServices', 'Holistic.CardService', 'Holistic.RoleService' , 'pascalprecht.translate', 'nvd3']);

var ready = false;
/*
* Global user object for client identification.
*/
var user = {
    departmentName: "",
    departmentAbbrev: "",
    companyName: "",
    departmentBarcode: "",
    isConsultant: false,
    consultantBarcode: ""
};

app.controller('LoadingCtrl', function ($scope, $rootScope, $state, $ionicSideMenuDelegate,$ionicPopup, $ionicPlatform,$timeout, $ionicHistory, $localStorage, $translate, WebSocketService, Analytics) {

    var zeroconf;
    var popup;
    var popupOpen = false;

    Analytics.trackView("Loading Screen");

    $ionicPlatform.ready(function () {
        //Check wifi connection
        if ( !ionic.Platform.is('browser') && !device.isVirtual ){
            if(navigator.connection.type != "wifi"){
                var popup = $ionicPopup.alert({
                    title: $translate.instant("noWifi"),
                    cssClass: 'center',
                    template: $translate.instant("connectWifi"),
                    okType: 'button-clear button-positive'
                });
            }

            else{
                findWifi();
            }
        }
    });

    var findWifi = function () {
        // Zeroconf service for ip address discovery of the game server.
        // Takes multiple seconds to resolve.
        zeroconf = cordova.plugins.zeroconf;

        zeroconf.watch('_http._tcp.', 'local.', function(result) {
            var action = result.action;
            console.log("Connection Result ---------->" + JSON.stringify(result));
            if( action == 'added' && result.service.name == 'holistic.game'){
                $localStorage.set("ip-address",result.service.ipv4Addresses);
            }
        }, function(error){
        });
    }

    //If wifi turns on
    document.addEventListener("online", function(){findWifi();onReady();} , false);
    
    $scope.connect = function () {
        var IP_Address = $localStorage.get("ip-address");
        console.log("IP Address ---------------------->" + IP_Address);
        
        if(IP_Address == undefined){
            popupOpen = true;
            popup = $ionicPopup.show({
                cssClass: 'style.css',
                template: $translate.instant("ipNotFound"),
                title: $translate.instant("enterIpAddress"),
                scope: $scope,
                buttons: [
                { 
                    text: $translate.instant("tryAgain"),
                    type: 'button-clear button-positive',
                    onTap: function(e) {
                        popupOpen = false;
                        onReady();
                    }
                },
                {
                    text: $translate.instant("enterIP"),
                    type: 'button-clear button-positive',
                    onTap: function(e) {
                        popupOpen = false;
                        $rootScope.connectManual();
                    }
                }
                ]
            });
        }
        else{
            WebSocketService.connect(IP_Address).then(function () {
                console.log("Connecting to websocket");
                // Check for connectSuccessful to always only go in here once.
                if (!$rootScope.connectSuccessful) {
                    if( typeof zeroconf != 'undefined' ){
                        zeroconf.close();
                    }
                    $rootScope.connectSuccessful = true;
                    //Prevent user from going manually back to the loading view.
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    if(popupOpen)
                    popup.close();
                    $rootScope.menu_loading = false;
                    $translate("gameName").then(function (text) {
                        $rootScope.companyName = "- " + text;
                    });
                    $state.go('app.home');
                }
            }, function () {
                console.log("Could not Connect to websocket");
                onReady();
            });
        }
    };
    //Check for ready so this view can be called multiple times and works even when the
    //$ionicPlatform.ready() function is not called. (But of course was at first load)
    var onReady = function () {
        console.log("Connecting");
        $timeout($scope.connect, 7000);
    };

    $rootScope.connectManual = function () {
        Analytics.trackEvent("User, Enter IP Manually");

        if($ionicSideMenuDelegate.isOpen())
        $ionicSideMenuDelegate.toggleLeft();
        
        $scope.address = {};

        var ip_popup = $ionicPopup.show({
            cssClass: 'style.css',
            template: '<input type="text" ng-model="address.ip">',
            title: $translate.instant("enterIpAddress"),
            scope: $scope,
            buttons: [
            { text: $translate.instant("cancel"),
              type: 'button-clear button-positive' },
            {
                text: $translate.instant("connect"),
                type: 'button-clear button-positive',
                onTap: function(e) {
                    $localStorage.set("ip-address", $scope.address.ip);
                    $scope.connect();
                }
            }
            ]
        });
    };

    $scope.$on('$ionicView.enter', function () {
        connectSuccessful = false
        $rootScope.hide_mail_icon = true;
        $rootScope.menu_loading = true;
        onReady();
    });


});
app.controller('AppCtrl',function($ionicSideMenuDelegate, $scope, $translate, Analytics){

    $scope.data = {};
    $scope.data.lang = 'de';
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };
    $scope.changeLang = function() {
        if($scope.data.lang == 'en'){
            Analytics.trackEvent("User, Change language to English");
            $translate.use('en');
        }
        else{
            Analytics.trackEvent("User, Change language to German");
            $translate.use('de');
        }
    };

});
app.controller('HomeCtrl', function ($state, $rootScope, $scope, $ionicPopup,$ionicSideMenuDelegate, $localStorage,$timeout, $ionicHistory, $translate, RoleService, WebSocketService, PubSubService, GameService, BarcodeService, Analytics) {

    Analytics.trackView("Home Screen");

    //This will be called when the user could sucessfuly be registered to the desired department.
    $scope.registeredToDepartmentCallback = function (userData) {

        user = userData;
        user.isConsultant = false;
        $localStorage.setObject("user", user);

        $rootScope.new_mail = false;
        $rootScope.hide_mail_icon = false;

        //This is done to get a clean state if the user was associated to another department before.
        RoleService.resetRoles();

        $rootScope.companyName = user.companyName;
        $rootScope.departmentAbbreviation = user.departmentAbbrev;

        //Subscribe to phase changes to switch to another screen.
        PubSubService.subscribe("phase", function (phase) {

            //Make the next view the root view.
            //This makes it impossible to get back to e.g. the company view if the user is currently in the department view.
            $ionicHistory.nextViewOptions({
                            disableBack: true,
                            historyRoot: true
                            });

            switch (phase) {
                case 0:
                    //Reload = true. See Issue #18
                    $state.go('app.balanceSheetRound',{}, {reload: true});
                    break;
                case 1:
                    $state.go('app.companyRound',{}, {reload: true});
                    break;
                case 2:
                    $state.go('app.departmentRound',{}, {reload: true});
                    break;
                default:
                    break;
            }
        });

        PubSubService.subscribe("mails", function (mails) {
            //Check if a mail has not been seen, then set new_mail = true so the icon changes.
            if( typeof mails != 'undefined' && mails.length > 0 ){
                $rootScope.$apply(function () {
                    $rootScope.new_mail = false;
                    mails.forEach( function(mail) {
                        if( mail.seen === 'null'){
                            $rootScope.new_mail = true;
                        }
                    });
                });
            }
        });
    };

    WebSocketService.setActionResultCallback(function (statusCode) {
        //Popup to show general messages to the user.
        var popupMessage = $translate.instant(statusCode);
        var popup = $ionicPopup.show({
            cssClass: 'notificationPopup',
            template: popupMessage
        });

        $timeout(function() {
            popup.close();
        }, 1000);
    });

    //$rootScope.method() for the menu.
    $rootScope.selectNewDepartment = function () {
        $scope.selectDepartment();
        $ionicSideMenuDelegate.toggleLeft(false);
    };

    $rootScope.switchToConsultant = function () {
        $scope.registerAsConsultant();
        $ionicSideMenuDelegate.toggleLeft(false);
    };

    $rootScope.showMails = function (){
        $state.go('app.mails');
    };

    $scope.selectDepartment = function () {

        //Dont start barcodeScanner on the emulator.
        if (ionic.Platform.is('browser') || device.isVirtual) {
            GameService.registerAsNormalUser($localStorage.get("departmentBarcode")).then(function (user) {
                $scope.registeredToDepartmentCallback(user);
            });
        } else {
            BarcodeService.scan(function (result) {
                if (result != 'undefined' && result.length !== 0 && !result.cancelled) {
                    GameService.registerAsNormalUser(result.text).then(function (user) {
                        $scope.registeredToDepartmentCallback(user);
                    });
                }
            });
        }
    };

    $scope.registrationAsConsultantSuccessful = function (consultant) {

        //Get clean state.
        RoleService.resetRoles();

        user.isConsultant = true;
        user.consultantBarcode = consultant.barcode;
        $localStorage.setObject("user", user);

        $rootScope.new_mail = false;
        $rootScope.hide_mail_icon = true;

        $rootScope.companyName = "- Consultant";
        $rootScope.departmentAbbreviation = "";

        $ionicHistory.clearCache();
        $ionicHistory.nextViewOptions({
            disableBack: true,
            historyRoot: true
        });
        $state.go('app.consultant');
    };

    $scope.registerAsConsultant = function () {

        if (ionic.Platform.is('browser') || device.isVirtual) {
            GameService.registerAsConsultant($localStorage.get("consultantBarcode")).then(function (consultant) {
                $scope.registrationAsConsultantSuccessful(consultant);
            });
        } else {
            BarcodeService.scan(function (result) {
                if (result != 'undefined' && result.length !== 0 && !result.cancelled) {
                    GameService.registerAsConsultant(result.text).then(function (consultant) {
                        $scope.registrationAsConsultantSuccessful(consultant);
                    });
                }
            });
        }

    };

    $scope.$on('$ionicView.enter', function () {

        if (!$localStorage.getObject("user").isConsultant && $localStorage.getObject("user").departmentBarcode && $localStorage.getObject("user").departmentBarcode.length > 0) {
            GameService.registerAsNormalUser($localStorage.getObject("user").departmentBarcode)
                .then(function (user) {
                    $scope.registeredToDepartmentCallback(user);
                });
        } else if ($localStorage.getObject("user").isConsultant) {
            GameService.registerAsConsultant($localStorage.getObject("user").consultantBarcode).then(function (consultant) {
                $scope.registrationAsConsultantSuccessful(consultant);
            });
        } 
        // else {

        //     var myPopup = $ionicPopup.show({
        //         title: $translate.instant("roleSelection"),
        //         scope: $scope,
        //         cssClass: 'style.css',
        //         buttons: [
        //             {
        //                 text: $translate.instant("player"),
        //                 type: 'button-clear button-positive',
        //                 onTap: function (e) {
        //                     $scope.selectDepartment();
        //                 }
        //             },
        //             {
        //                 text: $translate.instant("consultant"),
        //                 type: 'button-clear button-positive',
        //                 onTap: function (e) {
        //                     $scope.registerAsConsultant();
        //                 }
        //             }
        //         ]
        //     });
        // }
    });
});

app.controller('MailsCtrl', function ($scope, $rootScope, $ionicPopup, PubSubService, GameService, Analytics) {

    Analytics.trackView("Mail Screen");

    $scope.showMail = function (mail){
        var mailPopup = $ionicPopup.alert({
            title: mail.subject,
            template: mail.message,
            okType: 'button-clear button-positive'
        });
        mailPopup.then(function(res) {
            if( mail.seen == 'null' ){
                mail.seen = true;
                GameService.markMailAsSeen(mail.id);
                $rootScope.new_mail = false;
                $scope.mails.forEach(function(mail){
                    if( mail.seen == 'null' ){
                        $rootScope.new_mail = true;
                    }
                });
            }
        });
    };

    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hide_mail_icon = true;
        PubSubService.subscribe("mails", function (mails) {
            $scope.$apply(function(){
                $scope.mails = mails;
            });
        });
    });

    $scope.$on('$ionicView.leave', function () {
        $rootScope.hide_mail_icon = false;
        PubSubService.unsubscribe("mails");
    });
});
app.controller('BalanceSheetRoundCtrl', function ($scope,$rootScope, $ionicHistory,WebSocketService, Analytics) {

    Analytics.trackView("Balance Sheet Screen");

    if (ionic.Platform.isAndroid())
        $scope.isAndroid = true;
    else
        $scope.isAndroid = false;

    $scope.$on('$ionicView.loaded', function () {
        $ionicHistory.clearCache();
    });

    $scope.$on('$ionicView.beforeEnter', function () {
        $rootScope.hide_mail_icon = true;
    });

    $scope.$on('$ionicView.beforeLeave', function () {
        $rootScope.hide_mail_icon = false;
    });
});

app.controller('CompanyRoundCtrl', function ($scope, $state, $interval, $ionicHistory, RoleService, PubSubService, Analytics) {

    Analytics.trackView("Company Round Screen");

    if (ionic.Platform.isAndroid())
        $scope.isAndroid = true;
    else
        $scope.isAndroid = false;

    $scope.departmentResources = {
        money: 0,
        personnel: 0
    };
    var intervalPromise;
    var tick = function () {
        if ($scope.date.getMinutes() == 0 && $scope.date.getSeconds() == 0) {
            $interval.cancel(intervalPromise);
        } else {
            $scope.date.setSeconds($scope.date.getSeconds() - 1);
        }
    };

    $scope.showChangedStrategies = function () {
        $state.go('app.strategies', { enableActions: "false", onlyActiveAndNotActive: "true" });
    };

    $scope.registerAsResourceManager = function () {
        $state.go('app.resourcesDistribution');
    };

    $scope.registerAsExpertDistributor = function() {
        $state.go('app.expertDistribution');
    };

    $scope.registerAsSecretary = function () {
        $state.go('app.companyStrategy');
    };

    $scope.registerAsTimeManager = function () {
        if ($scope.timeManager == null) {
            $scope.timeManager = RoleService.requestTimeManagerRole(function (time) {
                $scope.$apply(function () {
                    //Cancel interval before setting up a new one. Otherwise you will have 2 :)
                    $interval.cancel(intervalPromise);
                    var ms = 1000 * Math.round(parseInt(time) / 1000); // round to nearest second
                    $scope.date = new Date(ms);
                    intervalPromise = $interval(tick, 1000);
                });
            }, function () {
                $scope.$apply(function () {
                    $interval.cancel(intervalPromise);
                    $scope.date = null;
                    $scope.timeManager = null;
                });
            });
        }
    };

    $scope.$on('$ionicView.loaded', function () {
        $ionicHistory.clearCache();
    });

    $scope.$on('$ionicView.beforeEnter', function () {
        PubSubService.subscribe("resources", function (resources) {
            $scope.$apply(function () {
                $scope.departmentResources = resources;
            });
        });
    });

    $scope.$on('$ionicView.leave', function () {
        PubSubService.unsubscribe("resources");
    });
});


app.controller('ResourcesDistributionCtrl', function ($scope, $state, $ionicHistory, $interval, RoleService, Analytics) {

    Analytics.trackView("Resource Distribution Screen");

    $scope.departments = [];
    $scope.companyResources = {
        money: 0,
        personnel: 0
    };
    $scope.resourceManager = null;
    var promise;

    // start... methods are used for increasing/decreasing the values when the user holds the button.

    $scope.startIncreasePersonnel = function ($index) {
        promise = $interval(function () {
            $scope.increasePersonnel($index);
        }, 100);
    }

    $scope.startDecreasePersonnel = function ($index) {
        promise = $interval(function () {
            $scope.decreasePersonnel($index);
        }, 100);
    }

    $scope.startIncreaseMoney = function ($index) {
        promise = $interval(function () {
            $scope.increaseMoney($index);
        }, 100);
    }

    $scope.startDecreaseMoney = function ($index) {
        promise = $interval(function () {
            $scope.decreaseMoney($index);
        }, 100);
    }

    /**
     * Is called when the user relases the button.
     * Stops the $interval for increasing / decreasing
     *
     * @param {any} $index Department index.
     */
    $scope.stopIncreaseOrDecrease = function ($index) {
        $interval.cancel(promise);
    }

    $scope.decreasePersonnel = function ($index) {
        if ($scope.departments[$index].personnel > 0) {
            $scope.departments[$index].personnel -= 1;
            $scope.companyResources.personnel += 1;
        }
    }
    $scope.increasePersonnel = function ($index) {
        if ($scope.companyResources.personnel > 0) {
            $scope.departments[$index].personnel += 1;
            $scope.companyResources.personnel -= 1;
        }
    }
    $scope.decreaseMoney = function ($index) {
        if ($scope.departments[$index].money > 0) {
            $scope.departments[$index].money -= 1;
            $scope.companyResources.money += 1;
        }
    }
    $scope.increaseMoney = function ($index) {
        if ($scope.companyResources.money > 0) {
            $scope.departments[$index].money += 1;
            $scope.companyResources.money -= 1;
        }
    }
    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.resourceManager = RoleService.requestResourceManagerRole(function (companyResources) {
            $scope.$apply(function () {
                $scope.companyResources.money = companyResources.companyMoney;
                $scope.companyResources.personnel = companyResources.companyPersonnel;
                $scope.departments = companyResources.departments;
            });
        }, function () {
            $scope.resourceManager = null;
            $ionicHistory.goBack();
        });
    });
});

app.controller('CompanyStrategyCtrl', function ($scope, $ionicHistory, RoleService, Analytics) {

    Analytics.trackView("Company Strategy Screen");

    $scope.companyStrategy = {};
    $scope.secretary = null;

    $scope.$on('$ionicView.enter', function () {
        $scope.secretary = RoleService.requestSecretaryRole(function (companyStrategy) {
            $scope.$apply(function () {
                $scope.companyStrategy.text = companyStrategy;
            });
        }, function () {
            $ionicHistory.goBack();
            $scope.secretary = null;
        });
    });
});

app.controller('ExpertDistributionCtrl', function($scope, $ionicHistory, RoleService, Analytics){

    Analytics.trackView("Expert Distribution Screen");

    $scope.experts = null;
    $scope.departmentAbbreviations = null;
    $scope.expertDistributor = null;

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.expertDistributor = RoleService.requestExpertDistributorRole(function (data) {
            $scope.$apply(function () {
                $scope.experts = data.experts;
                $scope.departmentAbbreviations = data.departmentAbbreviations;
            });
        }, function () {
            $ionicHistory.goBack();
            $scope.expertDistributor = null;
        });
    });
});
app.controller('DepartmentRoundCtrl', function ($scope, $rootScope, $state, $ionicPopup, $timeout, $ionicHistory, $interval, $localStorage, $translate, PubSubService, CardService, GameService, BarcodeService, Analytics) {

    Analytics.trackView("Department Round Screen");

    if (ionic.Platform.isAndroid())
      $scope.isAndroid = true;
    else
      $scope.isAndroid = false;

    $scope.departmentResources = {
        money: 0,
        personnel: 0
    };
    var implementStrategyPopup;

    var intervalPromise;
    var tick = function () {
        if ($scope.date.getMinutes() == 0 && $scope.date.getSeconds() == 0) {
            $interval.cancel(intervalPromise);
        } else {
            $scope.date.setSeconds($scope.date.getSeconds() - 1);
        }
    }

    $scope.buyStrategy = function () {

        Analytics.trackEvent("User, Buying Strategy Card");
        if (ionic.Platform.is('browser') || device.isVirtual) {
            CardService.buyStrategy($localStorage.get("strategyCardBarcode"));
        } else {
            BarcodeService.scan(function (result) {
                if (result != 'undefined' && result.length !== 0 && !result.cancelled) {
                    CardService.buyStrategy(result.text);
                }
            });
        }
    };

    $scope.buyCompetence = function () {
        Analytics.trackEvent("User, Buying Competence");
        if (ionic.Platform.is('browser') || device.isVirtual) {
            CardService.buyCompetence($localStorage.get("competenceCardBarcode"));
        } else {
            BarcodeService.scan(function (result) {
                if (result != 'undefined' && result.length !== 0 && !result.cancelled) {
                    CardService.buyCompetence(result.text);
                }
            });
        }
    }

    CardService.setCardHandledCallback(function (cardHandled) {
        var popupMessage = $translate.instant(cardHandled.statusCode);
        if (cardHandled.statusCode === "strategyCardBought") {
            Analytics.trackEvent("User, Stategy Bought Successfully");
            $rootScope.newBoughtStrategies.push(cardHandled.cardTitle);
            $rootScope.pickupNewCards++;
                                    
            implementStrategyPopup = $ionicPopup.show({
                title: cardHandled.cardTitle,
                cssClass: 'center',
                template: popupMessage + '<br>' + $translate.instant("implement") + '?',
                buttons: [
                    {
                        text: $translate.instant("now"),
                        type: 'button-clear button-positive',
                        onTap: function (e) {
                            Analytics.trackEvent("User, Implemented Strategy Now");
                            CardService.implementStrategy(cardHandled.cardId.toString());
                        }
                    },
                    {
                        text: $translate.instant("later"),
                        type: 'button-clear button-positive',
                        onTap: function (e) {
                            Analytics.trackEvent("User, Implemented Strategy Later");
                            implementStrategyPopup.close();
                        }
                    }
                ]
            });
        } else {
            if( cardHandled.cardTitle != ''){
                var popup = $ionicPopup.alert({
                    title: cardHandled.cardTitle,
                    cssClass: 'center',
                    template: popupMessage,
                    okType: 'button-clear button-positive'
                });
            } else {
                var popup = $ionicPopup.alert({
                    cssClass: 'center popup-no-title',
                    template: popupMessage,
                    okType: 'button-clear button-positive'
                });
            }
        }
    });

    $scope.$on('$ionicView.beforeEnter', function () {
        PubSubService.subscribe("resources", function (resources) {
            $scope.$apply(function () {
                $scope.departmentResources = resources;
            });
        });
        PubSubService.subscribe("time", function (ms) {
            $scope.$apply(function () {
                $scope.date = new Date(ms);
            });
        });

        if( typeof intervalPromise === 'undefined' ){
            intervalPromise = $interval(tick, 1000);
        }
    });

    $scope.$on('$ionicView.loaded', function () {
        $ionicHistory.clearCache();
    });

    $scope.$on('$ionicView.leave', function () {
        PubSubService.unsubscribe("resources");
        PubSubService.unsubscribe("time");
    });
});

app.controller('CompanyValuesCtrl', function ($scope, PubSubService, $filter, $translate, $localStorage, Analytics) {

    Analytics.trackView("Company Values Screen");

    $scope.companyValues;

    PubSubService.subscribe("companyValues", function (data) {
        $scope.$apply(function () {
            $scope.companyValues = data;

            $scope.options = {
                chart: {
                    type: 'multiBarHorizontalChart',
                    height: 500,
                    x: function(d){return d.label;},
                    y: function(d){return d.value;},
                    valueFormat:d3.format('.0f'),
                    showControls: true,
                    showValues: true,
                    duration: 500,
                    xAxis: {
                        showMaxMin: false,
                        fontSize: 5
                    },
                    yAxis: {
                        axisLabel: 'Values',
                        tickFormat: function(d){
                            return d3.format(',.0f')(d);
                        },
                        height:30
                    },
                    legend:{
                        align: false
                    },
                    stacked: true,
                    margin: {
                      left: 168
                    }
                },
                title:{
                        enable: true,
                        text: $filter('translate')('companyValues'),
                }
            };

            $scope.data = [
                {
                    "key": $filter('translate')('yourDepartment'),
                    "color": "#d62728",
                    "values": [
                        {
                            "label" : $filter('translate')('ecologyEfficiency') ,
                            "value" : $scope.companyValues.departmentData.ecologyEfficiency
                        } ,
                        {
                            "label" : $filter('translate')('companyProfit') ,
                            "value" : $scope.companyValues.departmentData.companyProfit
                        } ,
                        {
                            "label" : $filter('translate')('customerSatisfaction') ,
                            "value" : $scope.companyValues.departmentData.customerSatisfaction
                        } ,
                        {
                            "label" : $filter('translate')('ecologicalImpact') ,
                            "value" : $scope.companyValues.departmentData.ecologicalImpact
                        } ,
                        {
                            "label" : $filter('translate')('LCCostManufacturer') ,
                            "value" : $scope.companyValues.departmentData.LCCostManufacturer
                        } ,
                        {
                            "label" : $filter('translate')('totalCostofOwnership') ,
                            "value" : $scope.companyValues.departmentData.totalCostofOwnership
                        } ,
                        {
                            "label" : $localStorage.getObject("user").isConsultant || ($scope.companyValues.economyLevel>=6) ? $filter('translate')('companyImage') : "???",
                            "value" : $scope.companyValues.departmentData.companyImage
                        } ,
                        {
                            "label" : $localStorage.getObject("user").isConsultant || ($scope.companyValues.economyLevel>=6) ? $filter('translate')('marketPotential') : "????",
                            "value" : $scope.companyValues.departmentData.marketPotential
                        }
                    ]
                },
                {
                    "key": $filter('translate')('yourCompany'),
                    "color": "#1f77b4",
                    "values": [
                        {
                            "label" : $filter('translate')('ecologyEfficiency') ,
                            "value" : $scope.companyValues.companyData.ecologyEfficiency
                        } ,
                        {
                            "label" : $filter('translate')('companyProfit') ,
                            "value" : $scope.companyValues.companyData.companyProfit
                        } ,
                        {
                            "label" : $filter('translate')('customerSatisfaction') ,
                            "value" : $scope.companyValues.companyData.customerSatisfaction
                        } ,
                        {
                            "label" : $filter('translate')('ecologicalImpact') ,
                            "value" : $scope.companyValues.companyData.ecologicalImpact
                        } ,
                        {
                            "label" : $filter('translate')('LCCostManufacturer') ,
                            "value" : $scope.companyValues.companyData.LCCostManufacturer
                        } ,
                        {
                            "label" : $filter('translate')('totalCostofOwnership') ,
                            "value" : $scope.companyValues.companyData.totalCostofOwnership
                        } ,
                        {
                            "label" : $localStorage.getObject("user").isConsultant || ($scope.companyValues.economyLevel>=6) ? $filter('translate')('companyImage') : "???" ,
                            "value" : $scope.companyValues.companyData.companyImage
                        } ,
                        {
                            "label" : $localStorage.getObject("user").isConsultant || ($scope.companyValues.economyLevel>=6) ? $filter('translate')('marketPotential') : "????" ,
                            "value" : $scope.companyValues.companyData.marketPotential
                        }
                    ]
                }
            ]

        });
    });
});

app.controller('InformationCtrl', function ($scope, $state, GameService, $ionicPopup, $translate, $localStorage, BarcodeService, Analytics) {

    Analytics.trackView("Information Screen");

    if (ionic.Platform.isAndroid())
        $scope.isAndroid = true;
    else
        $scope.isAndroid = false;

    $scope.getStrategyInfo = function() {

        if (ionic.Platform.is('browser') || device.isVirtual) {
            GameService.getStrategyWithDependencies($localStorage.get("strategyCardBarcode")).then(function (message) {
                $state.go('app.singleStrategy', { strategyCard: message.strategy[0], enableActions: true,
                     internalDependencies: message.internalDependencies, externalDependencies: message.externalDependencies });
            });
        }
        else{

            BarcodeService.scan(function (result) {
                if (result != 'undefined' && result.length !== 0 && !result.cancelled) {
                    GameService.getStrategyWithDependencies(result.text).then(function (message) {
                        $state.go('app.singleStrategy', { strategyCard: message.strategy[0], enableActions: true,
                             internalDependencies: message.internalDependencies, externalDependencies: message.externalDependencies });
                    });
                }
            });
        }

    };
});
