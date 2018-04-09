var app = angular.module('Holistic.WebSocketService', []);
/**
 * The WebSocketService provides functionality for sending messages via websocket, connect to the web server,
 * registering promises and callbacks for incoming message processing.
 *
 */
app.factory('WebSocketService', function ($state, $ionicHistory, $q) {

    var webSocket;
    var registeredCallbacks = [];
    var registeredPromises = {};
    var actionResultCallback = null;

    /**
     * Trys to connect to the HolisticAppServer with the given adress.
     * Look at the documentation for the .onopen, .onclose, .onerror and .onmessage functions for detailed information
     * about the behaviour of this service. 
     * 
     * @param {any} serverAddress
     * @returns
     */
    this.connect = function (serverAddress) {
        
        var deferred = $q.defer();
        if( typeof webSocket != 'undefined'){
            webSocket.close();
        }
        webSocket = new WebSocket("ws://" + serverAddress + ":8080/holistic/user/");

        /**
         * If everything goes well the promise will just resolve.
         */
        webSocket.onopen = function () {
            deferred.resolve();
        };

        /**
         * Show loading view or reject promise -> dependent on the current $state.
         */
        webSocket.onclose = function () {
            if ($ionicHistory.currentStateName() !== "loading") {
                $ionicHistory.nextViewOptions({
                            disableBack: true,
                            historyRoot: true
                            });
                $state.go('app.loading');
            } else {
                deferred.reject();
            }
        };
        /**
         * Show loading view or reject promise -> dependent on the current $state.
         */
        webSocket.onerror = function () {
            if ($ionicHistory.currentStateName() !== "loading") {
                $ionicHistory.nextViewOptions({
                            disableBack: true,
                            historyRoot: true
                            });
                $state.go('app.loading');
            } else {
                deferred.reject();
            }
        };
        /**
         * Handles all incoming messages and forwards them to the registered callbacks / promises.
         * 
         * @param {any} event
         * @returns
         */
        webSocket.onmessage = function (event) {

            var message = JSON.parse(event.data);
            console.log("Receive Data ------------------------------>" + JSON.stringify(message));
            if (message.type === 'actionResult') {
                if (actionResultCallback) {
                    actionResultCallback(message.statusCode);
                    //Return early because only the actionResultCallback should receive the message. 
                    return;
                }
            }

            var promise = registeredPromises[message.type]
            if (typeof promise != 'undefined') {
                promise.resolve(message[message.type]);
                delete registeredPromises[message.type];
                return;
            }

            registeredCallbacks.forEach(function (callback) {
                callback(event.data);
            });

        };
        return deferred.promise;
    };

    /**
     * Sends data via websocket to the web server.
     * 
     * @param {any} data This object will be stringified.
     */
    this.send = function (data) {
        console.log("Send Data ------------------------------>" + JSON.stringify(data));
        webSocket.send(JSON.stringify(data));
    };

    /**
     * Register callback which will receive the pure message data (json string)
     * 
     * @param {any} callback
     */
    this.registerOnMessageCallback = function (callback) {
        registeredCallbacks.push(callback);
    };

    /**
     * Register promises under given name -> If the type of the message matches a registered promise, 
     * the promise will be resolved and the data of the message passed to this promise.
     * 
     * @param {any} name Should be unique.
     * @param {any} promise
     */
    this.registerPromise = function (name, promise) {
        registeredPromises[name] = promise;
    };

    /**
     * Set the callback for showing general receiving general messages.
     * (E.g. some action was successful) 
     * 
     * @param {any} actionResultCallbackParam
     */
    this.setActionResultCallback = function (actionResultCallbackParam) {
        actionResultCallback = actionResultCallbackParam;
    };

    return this;
});