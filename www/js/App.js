var app = angular.module('Holistic', ['ionic', 'Holistic.MainControllers', 'Holistic.UtilityServices', 'pascalprecht.translate']);


// app.constant('google_analytics_key', 'UA-115439514-1') // Production Key
app.constant('google_analytics_key', 'UA-53900263-5') // Testing Key

app.run(function ($ionicPlatform, $rootScope, $localStorage, PermissionService, google_analytics_key, Analytics) {

    $rootScope.hide_mail_icon = true;
    $rootScope.menu_loading = true;
    $rootScope.connectSuccessful = false;
    $rootScope.pickupNewCards = 0;
    $rootScope.newBoughtStrategies = [];

    $ionicPlatform.ready(function () {

      //Check if running in an emulator, then set ip address and other values accordingly
      // -> Easier development
      if (ionic.Platform.is('browser') || device.isVirtual) {


        if ( ionic.Platform.is('browser') ) {
          $localStorage.set("ip-address", "127.0.0.1");
        } else {
          $localStorage.set("ip-address", "10.0.2.2");
        }
        $localStorage.set("departmentBarcode", "10015001");
        $localStorage.set("strategyCardBarcode", "50640003");
        $localStorage.set("competenceCardBarcode", "60784001");
        $localStorage.set("consultantBarcode", "99900999");
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

      PermissionService.hasCameraPermission();
      Analytics.startAnalytics(google_analytics_key);
      cordova.getAppVersion.getVersionNumber().then(function (version) {
          Analytics.setAppVersion(version);
      });
    });
});
/**
 * Ionic configuration: States, translations
 */
app.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $translateProvider) {

  //This fixes the bug, that when the keyboard is opened the whole screen moves up.
  $ionicConfigProvider.scrolling.jsScrolling(false);
  $ionicConfigProvider.views.forwardCache(true);

  $urlRouterProvider.otherwise('/app/loading');

  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/app.html',
    controller: 'AppCtrl'
  });

  $stateProvider.state('app.home', {
    url: '/home',
    views: {
      'appContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  });

  $stateProvider.state('app.loading', {
    url: '/loading',
    views: {
      'appContent': {
        templateUrl: 'templates/loading.html',
        controller: 'LoadingCtrl'
      }
    }
  });

  $stateProvider.state('app.mails', {
    url: '/mails',
    views: {
      'appContent': {
        templateUrl: 'templates/mails.html',
        controller: 'MailsCtrl'
      }
    }
  });

  $stateProvider.state('app.consultant', {
    url: '/consultant',
    views: {
      'appContent': {
        templateUrl: 'templates/consultant/consultant.html',
        controller: 'ConsultantCtrl'
      }
    }
  });

  $stateProvider.state('app.distributeResources', {
    url: '/distributeResources',
    views: {
      'appContent': {
        templateUrl: 'templates/consultant/distributeResources.html',
        controller: 'DistributeResourcesCtrl'
      }
    }
  });

  //Dont cache this view (otherwise stateParams wouldnt be updated after visisted once)
  $stateProvider.state('app.research', {
    url: '/research',
    cache: false,
    params: { 'department': null },
    views: {
      'appContent': {
        templateUrl: 'templates/consultant/research.html',
        controller: 'ResearchCtrl'
      }
    }
  });

  $stateProvider.state('app.strategies', {
    url: '/strategies',
    params: { enableActions: "true", onlyActiveAndNotActive: "false" },
    views: {
      'appContent': {
        templateUrl: 'templates/strategies.html',
        controller: 'StrategiesCtrl'
      }
    }
  });

  //Dont cache this view (otherwise stateParams wouldnt be updated after visisted once)
  $stateProvider.state('app.singleStrategy', {
    url: '/singleStrategy',
    cache: false,
    params: { strategyCard: null, enableActions: "true", internalDependencies: null , externalDependencies: null },
    views: {
      'appContent': {
        templateUrl: 'templates/singleStrategy.html',
        controller: 'SingleStrategyCtrl'
      }
    }
  });

   $stateProvider.state('app.boughtStrategies', {
    url: '/boughtStrategies',
    views: {
      'appContent': {
        templateUrl: 'templates/boughtStrategies.html',
        controller: 'BoughtStrategiesCtrl'
      }
    }
  });

  $stateProvider.state('app.competences', {
    url: '/competences',
    views: {
      'appContent': {
        templateUrl: 'templates/competences.html',
        controller: 'CompetencesCtrl'
      }
    }
  });
  //Dont cache this view (otherwise stateParams wouldnt be updated after visisted once)
  $stateProvider.state('app.singleCompetence', {
    url: '/singleCompetence',
    cache: false,
    params: { 'competenceCard': null },
    views: {
      'appContent': {
        templateUrl: 'templates/singleCompetence.html',
        controller: 'SingleCompetenceCtrl'
      }
    }
  });

  $stateProvider.state('app.balanceSheetRound', {
    url: '/balanceSheetRound',
    views: {
      'appContent': {
        templateUrl: 'templates/balanceSheetRound.html',
        controller: 'BalanceSheetRoundCtrl'
      }
    }
  });

  $stateProvider.state('app.departmentRound', {
    url: '/departmentRound',
    views: {
      'appContent': {
        templateUrl: 'templates/departmentRound.html',
        controller: 'DepartmentRoundCtrl'
      }
    }
  });

  $stateProvider.state('app.companyRound', {
    url: '/companyRound',
    views: {
      'appContent': {
        templateUrl: 'templates/companyRound/companyRound.html',
        controller: 'CompanyRoundCtrl'
      }
    }
  });
  $stateProvider.state('app.resourcesDistribution', {
    url: '/resourcesDistribution',
    views: {
      'appContent': {
        templateUrl: 'templates/companyRound/resourcesDistribution.html',
        controller: 'ResourcesDistributionCtrl'
      }
    }
  });
  $stateProvider.state('app.companyStrategy', {
    url: '/companyStrategy',
    views: {
      'appContent': {
        templateUrl: 'templates/companyRound/companyStrategy.html',
        controller: 'CompanyStrategyCtrl'
      }
    }
  });
  $stateProvider.state('app.expertDistribution', {
    url: '/expertDistribution',
    views: {
      'appContent': {
        templateUrl: 'templates/companyRound/expertDistribution.html',
        controller: 'ExpertDistributionCtrl'
      }
    }
  });

  $stateProvider.state('app.companyValues', {
    url: '/companyValues',
    cache: false,
    views: {
      'appContent': {
        templateUrl: 'templates/companyValues.html',
        controller: 'CompanyValuesCtrl'
      }
    }
  });

  $stateProvider.state('app.information', {
    url: '/information',
    views: {
      'appContent': {
        templateUrl: 'templates/information.html',
        controller: 'InformationCtrl'
      }
    }
  });


  $translateProvider.translations('de', {
    "gameName": "Big Motors",
    "connectManual": "IP Adresse",
    "enterIpAddress": "IP Adresse eingeben:",
    "connect": "Verbinden",
    "close": "Schließen",
    "cancel": "Abbrechen",
    "save": "Speichern",
    "options": "Optionen",
    "selectNewDepartment": "Neue Abteilung",
    "switchToConsultant": "Consultant",
    "roleSelection": "Wählen sie eine Spielrolle!",
    "player": "Spieler",
    "consultant": "Berater",
    "scanError": "Fehler beim scannen!",
    "roundOneName": "Bilanzrunde",
    "roundTwoName": "Unternehmensrunde",
    "roundThreeName": "Abteilungsrunde",
    "description": "Beschreibung",
    "advantages": "Vorteile",
    "disadvantages": "Nachteile",
    "internalDependencies": "Interne Abhängigkeiten",
    "externalDependencies": "Externe Abhängigkeiten",
    "dependencies": "Abhängigkeiten",
    "outOf": "von",
    "personnel": "Personalkosten",
    "implement": "Implementieren",
    "deplement": "Strategie zurücknehmen",
    "sell": "Verkaufen",
    "scan": "Scannen",
    "bought": "Nicht implementiert",
    "implemented": "Implementiert",
    "active": "Aktiv",
    "notActive": "Nicht aktiv",
    "summary": "Zusammenfassung",
    "strategyOverview": "Strategienübersicht",
    "competenceCardsOverview": "Kompetenzenübersicht",
    "competenceCards": "Kompetenzkarten",
    "competenceValues": "Kompetenzwerte",
    "economicCompetence": "Ökonomische",
    "ecologicCompetence": "Ökologische",
    "networkCompetence": "Netzwerk",
    "changedStrategies": "Geänderte Strategien",
    "roll": "Für Spieler würfeln",
    //roundThreeTranslations
    "buyStrategy": "Strategie kaufen",
    "buyCompetence": "Kompetenz kaufen",
    "strategyCard": "Strategiekarte",
    "lifeCycleCard": "Lifecyclekarte",
    "showNewBoughtStrategies" : "Neue Karten abholen",
    "now": "Jetzt",
    "later": "Später",
    "overview" : "Übersicht",
    "strategyInvalid" : "Gescannte Karte ist keine Strategie.",
    "strategyCardDeplemented": "Strategie wurde zurückgenommen.",
    "strategyCardNotDeplemented": "Strategie konnte nicht zurückgenommen werden.",
    "strategyCardDeplementedWithLoss": "Strategie wurde zurückgenommen, da diese aber vorher schon mind. eine Runde implementiert war bekommen Sie nicht das gesamte Personal zurück.",
    "strategyCardTooExpensive": "Sie haben nicht genügend Kapital um diese Strategie zu kaufen.",
    "strategyCardImplemented": "Strategie implementiert.",
    "strategyCardNotImplemented": "Strategie konnte nicht implementiert werden.",
    "strategyCardNotEnoughPersonnel": "Nicht genügend Personal.",
    "strategyCardBought": "Strategie gekauft.",
    "strategyCardAlreadyBought": "Diese Strategie ist schon in Ihrem Besitz.",
    "strategyCardSold": "Strategie verkauft.",
    "strategyCardAlreadyImplemented": "Strategie war bereits implementiert und kann nun nicht mehr verkauft werden.",
    "strategyCardFromOtherDepartment" : "Strategie ist nicht aus ihrer Abteilung!",
    "lcCardInvalid" : "Gescannte Karte ist keine Lifecyclekarte.",
    "lcCardSold": "Lifecyclekarte verkauft.",
    "lcCardBought": "Lifecyclekarte gekauft.",
    "lcCardAlreadyBought": "Lifecyclekarte ist schon in Ihrem Besitz.",
    "lcCardTooExpensive": "Sie haben nicht genügend Kapital um diese LifeCyclekarte zu kaufen.",
    "error": "Ein Fehler ist aufgetreten, bitte versuche Sie es erneut.",
    "cardNotFound": "Keine gültige Karte!",
    "resourceDistribution": "Resourcenverteilung",
    "research": "Forschung",
    //companyRound Translations
    "registerResourceManager": "Ressourcenmanager",
    "registerTimeManager": "Zeitmanager",
    "registerSecretary": "Strategiemanager",
    "registerExpertDistributor": "Expertenmanager",
    "companyStrategy": "Unternehmensstrategie",
    "strategySubmitted": "Strategie gespeichert!",
    "resourcesSubmitted": "Ressourcen gespeichert!",
    "expertDistributionSubmitted": "Expertenverteilung gespeichert!",
    //Expert translations @TODO: Make this on the server side?
    "expert.0": "Spezialist f. Forschung",
    "expert.1": "Forschungsvisionär",
    "expert.2": "Entwickler",
    "expert.3": "Kommunikationstrainer",
    "expert.4": "Rekruter",
    "expert.5": "Anwalt f. Personalfragen",
    "expert.6": "Saboteur",
    "expert.7": "Informationsmanager",
    "expert.8": "Kredithai",
    "expert.9": "Lobbyist",
    "expert.10": "Personalmanager",
    "expert.11": "Spion",
    "expert.12": "PR-Manager",
    //consultant
    "getStrategyInfo": "Strategieinfo",
    "researchOptions": "Forschungsoptionen",
    "rolled": "Würfelergebnis: ",
    "alreadyResearched": "Wurde bereits erfolgreich erforscht. Bitte wählen Sie ein anderes Forschungsprojekt!",
    "researchTopics": "Forschungsbereiche",
    "complexity": "Komplexität",
    "researchSuccessful": "Forschung war erfolgreich!",
    "researchNotSuccessful": "Forschung war nicht erfolgreich!",
    "researchSuccessfulButton": "Forschung erfolgreich",
    "researchNotSuccessfulButton": "Forschung nicht erfolgreich",
    "notEnoughMoney": "Nicht genug Geld zu Verfügung!",

    "language": "Sprache",
    "information": "Information",
    "companyValues": "Unternehmenswerte",
    "strategyInfo": "Strategie Informationen",
    "noDependencies" : "Keine Abhängigkeiten",

    "yourCompany":"Ihr Unternehmen",
    "yourDepartment":"Ihre Abteilung",
    "ecologyEfficiency": "Ökologische Effizienz",
    "companyProfit": "Unternehmensgewinn",
    "customerSatisfaction": "Kundenzufriedenheit",
    "ecologicalImpact": "Ökologische Auswirkungen",
    "LCCostManufacturer": "Lebenszykluskosten Hersteller",
    "totalCostofOwnership": "Eigentumsgesamtkosten",
    "companyImage": "Firmenimage",
    "marketPotential": "Marktpotential",

    "connecting": "Verbindung zum Server",
    "noWifi": "WIFI-Verbindung nicht gefunden",
    "connectWifi": "Bitte verbinden Sie sich mit einem lokalen WLAN und versuchen Sie es erneut",
    "ipNotFound": "Verbindung zum Server konnte nicht hergestellt werden",
    "enterIP":"IP Eingeben",
    "tryAgain": "Versuchen Sie es erneut",

  });

$translateProvider.translations('en', {
    "gameName": "Big Motors",
    "connectManual": "IP Address",
    "enterIpAddress": "Enter IP address:",
    "connect": "Connect",
    "close": "Close",
    "cancel": "Cancel",
    "save": "Save",
    "options": "Options",
    "selectNewDepartment": "New Department",
    "switchToConsultant": "Consultant",
    "roleSelection": "Choose a game role!",
    "player": "Player",
    "consultant": "Consultant",
    "scanError": "Error scanning!",
    "roundOneName": "Balance round",
    "roundTwoName": "Business Round",
    "roundThreeName": "Department round",
    "description": "Description",
    "advantages": "Advantages",
    "disadvantages": "Disadvantages",
    "internalDependencies": "Internal Dependencies",
    "externalDependencies": "External Dependencies",
    "dependencies": "Dependencies",
    "outOf": "Out of",
    "personnel": "Personnel",
    "implement": "Implement",
    "deplement": "Deplement strategy",
    "sell": "Sell",
    "scan": "Scan",
    "bought": "Not implemented",
    "implemented": "Implemented",
    "active": "Active",
    "notActive": "Not active",
    "summary": "Summary",
    "strategyOverview": "Strategy Overview",
    "competenceCardsOverview": "Competence Cards Overview",
    "competenceCards": "CompetenceCards",
    "competenceValues": "Competence values",
    "economicCompetence": "Economic",
    "ecologicCompetence": "Ecological",
    "networkCompetence": "Network",
    "changedStrategies": "Changed strategies",
    "roll": "Roll dice for player",
    //roundThreeTranslations
    "buyStrategy": "Buy Strategy",
    "buyCompetence": "Buy Competence",
    "strategyCard": "Strategy Card",
    "lifeCycleCard": "Life Cycle Card",
    "showNewBoughtStrategies" : "Pick up new cards",
    "now": "Now",
    "later": "Later",
    "overview" : "Overview",
    "strategyInvalid" : "Scanned card is not a strategy.",
    "strategyCardDeplemented": "Strategy has been deplemented.",
    "strategyCardNotDeplemented": "Strategy could not be deplemented.",
    "strategyCardDeplementedWithLoss": "Strategy was deplemented, but since this was already implemented at least one round before you do not get all the personnel back.",
    "strategyCardTooExpensive": "You do not have enough money to buy this strategy.",
    "strategyCardImplemented": "Strategy implemented.",
    "strategyCardNotImplemented": "Strategy could not be implemented.",
    "strategyCardNotEnoughPersonnel": "Not enough personnel.",
    "strategyCardBought": "Strategy bought.",
    "strategyCardAlreadyBought": "This strategy has already been bought",
    "strategyCardSold": "Strategy sold.",
    "strategyCardAlreadyImplemented": "Strategy has already been implemented and can no longer be sold.",
    "strategyCardFromOtherDepartment" : "Strategy is not from your department!",
    "lcCardInvalid" : "Scanned card is not a lifecycle card.",
    "lcCardSold": "Lifecycle card sold.",
    "lcCardBought": "Lifecycle card bought.",
    "lcCardAlreadyBought": "Lifecycle card has already been bought",
    "lcCardTooExpensive": "You do not have enough money to buy this LifeCycle Card.",
    "error": "An error has occurred, please try again.",
    "cardNotFound": "Not valid card!",
    "resourceDistribution": "Resource distribution",
    "research": "Research",
    //companyRound Translations
    "registerResourceManager": "Resource Manager",
    "registerTimeManager": "Time manager",
    "registerSecretary": "Strategy manager",
    "registerExpertDistributor": "Expert manager",
    "companyStrategy": "Company Strategy",
    "strategySubmitted": "Strategy stored!",
    "resourcesSubmitted": "Resources stored!",
    "expertDistributionSubmitted": "Expert distribution stored!",
    //Expert translations @TODO: Make this on the server side?
    "expert.0": "Research specialist",
    "expert.1": "Research visionary",
    "expert.2": "Developer",
    "expert.3": "Communication trainer",
    "expert.4": "Recruiter",
    "expert.5": "Attorney f. personnel matters",
    "expert.6": "Saboteur",
    "expert.7": "Informations manager",
    "expert.8": "Loan shark",
    "expert.9": "Lobbyist",
    "expert.10": "Personal manager",
    "expert.11": "Spy",
    "expert.12": "PR-Manager",
    //consultant
    "getStrategyInfo": "Strategy Info",
    "researchOptions": "Research options",
    "rolled": "dice roll: ",
    "alreadyResearched": "Has already been successfully researched. Please select another research project!",
    "researchTopics": "research areas",
    "complexity": "complexity",
    "researchSuccessful": "Research was successful!",
    "researchNotSuccessful": "Research was not successful!",
    "researchSuccessfulButton": "Research successful",
    "researchNotSuccessfulButton": "Research not successful",
    "notEnoughMoney": "Not enough money available!",

    "language": "Language",
    "information": "Information",
    "companyValues": "Company Values",
    "strategyInfo": "Strategy Information",
    "dependencies" : "Dependencies",
    "noDependencies" : "No Dependencies",

    "yourCompany":"Your Company",
    "yourDepartment":"Your Department",
    "ecologyEfficiency": "Ecological efficiency",
    "companyProfit": "Company profit",
    "customerSatisfaction": "Customer Satisfaction",
    "ecologicalImpact": "Ecological impact",
    "LCCostManufacturer": "LifeCycle cost manufacturer",
    "totalCostofOwnership": "Total cost of ownership",
    "companyImage": "Company image",
    "marketPotential": "Market potential",

    "connecting": "Connecting to Server",
    "noWifi": "WIFI connection not found",
    "connectWifi": "Please connect to a local wifi and try again",
    "ipNotFound": "Could not connect to server",
    "enterIP":"Enter IP",
    "tryAgain": "Try Again",


  });

  $translateProvider.preferredLanguage('de');

});
