var app = angular.module('Holistic.UtilityServices', []);
/**
 * Service to store objects permanently. After a restart this data is still there.
 */
app.factory('$localStorage', ['$window', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    };
}]);

app.factory('BarcodeService', function ($ionicPopup, $translate) {
    var scan = function(callback){
        cordova.plugins.barcodeScanner.scan(function (result) {
          callback(result);
        },
        function (error) {
            var popup = $ionicPopup.alert({
                title: $translate.instant("scanError"),
                cssClass: 'center',
                template: error,
                okType: 'button-clear button-positive'
            });
        },
        {
          showFlipCameraButton : true
        });
    }
    return {
      scan:scan
    }
});

app.factory('Analytics', function() {
    var startAnalytics = function(analyticID) {
      if (window.ga) {
        window.ga.startTrackerWithId(analyticID);
      }
    }
    var trackView = function(screenTitle) {
      if (window.ga) {
        window.ga.trackView(screenTitle);
      }
    }
    var trackEvent = function(category, action) {
      if (window.ga) {
        window.ga.trackEvent(category, action);
      }
    }
    var trackEventWithLable = function(category, action, lable) {
      if (window.ga) {
        window.ga.trackEvent(category, action, lable);
      }
    }
    var setUserId = function(userId) {
      if (window.ga) {
        window.ga.setUserId(userId);
      }
    }
    var setAppVersion = function(version) {
      if (window.ga) {
        window.ga.setAppVersion(version);
      }
    }
    return {
      trackView: trackView,
      trackEvent: trackEvent,
      setUserId: setUserId,
      setAppVersion:setAppVersion
    }
});

app.factory('PermissionService', function(Analytics) {
    var hasCameraPermission = function() {
      if ( !ionic.Platform.is('browser') && !device.isVirtual ){
        var permissions = cordova.plugins.permissions;
        var list = [
          permissions.WRITE_SETTINGS ,
          permissions.CAMERA
        ];

        permissions.hasPermission(list, success, error);

        function error() {
          console.warn('Camera or Settings permission is not turned on');
        }

        function success( status ) {
          if( !status.hasPermission ) {
            permissions.requestPermissions(
              list,
              function(status) {
                if( !status.hasPermission ) error();
              },
              error);
          }
        }
      }
    }
    return {
      hasCameraPermission: hasCameraPermission
    }
});