var app = angular.module('Holistic.CardService', ['Holistic.WebSocketService']);

/**
 * Service for buying, selling, implementing and deplement cards (strategy and competence).
 */
app.factory('CardService', function (WebSocketService) {

    var cardHandledCallback = null;


    /**
     * Trys to get the strategy information associated with the passed barcode.
     * 
     * @param {any} barcode
     */
    // this.getStrategyInfo = function (barcode) {
    //     var getStrategyInfoAction = {
    //         type: "getStrategyWithDependencies",
    //         barcode: barcode
    //     };
    //     WebSocketService.send(getStrategyInfoAction);
    // };
    /**
     * Trys to buy the strategy associated with the passed barcode.
     * 
     * @param {any} barcode
     */
    this.buyStrategy = function (barcode) {
        var buyStrategyAction = {
            type: "buyStrategy",
            barcode: barcode
        };
        WebSocketService.send(buyStrategyAction);
    };
    /**
     * Trys to sell the strategy associated with the passed id.
     * 
     * @param {any} id
     */
    this.sellStrategy = function (id) {
        var sellStrategyAction = {
            type: "sellStrategy",
            id: id
        };
        WebSocketService.send(sellStrategyAction);
    };

    /**
     * Trys to buy the competence associated with the passed barcode.
     * 
     * @param {any} barcode
     */
    this.buyCompetence = function (barcode) {
        var buyCompetenceAction = {
            type: "buyCompetence",
            barcode: barcode
        };
        WebSocketService.send(buyCompetenceAction);
    };

    /**
     * Trys to sell the competence associated with the passed id.
     * 
     * @param {any} id
     */
    this.sellCompetence = function (id) {
        var sellCompetenceAction = {
            type: "sellCompetence",
            id: id
        };
        WebSocketService.send(sellCompetenceAction);
    };
    /**
     * Trys to implement the strategy associated with the passed id.
     * 
     * @param {any} id
     */
    this.implementStrategy = function (id) {
        var strategyCardAction = {
            type: "implementStrategy",
            id: id
        };
        WebSocketService.send(strategyCardAction);
    };
    /**
     * Trys to deplement the strategy associated with the passed id.
     * 
     * @param {any} id
     */
    this.deplementStrategy = function (id) {
        var strategyCardAction = {
            type: "deplementStrategy",
            id: id
        };
        WebSocketService.send(strategyCardAction);
    };

    /**
     * Set callback for receiving messages which contain the result of card actions.
     * (E.g. Card successfully bought.)
     * 
     * @param {any} callback
     */
    this.setCardHandledCallback = function (callback) {
        cardHandledCallback = callback;
    };

    WebSocketService.registerOnMessageCallback(function (jsonMessage) {
        message = JSON.parse(jsonMessage);
        if (message.type === "cardHandledResult") {
            if (cardHandledCallback) {
                cardHandledCallback(message);
            }
        }
    });

    return this;
});