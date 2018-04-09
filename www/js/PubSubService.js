var app = angular.module('Holistic.PubSubService', ['Holistic.WebSocketService']);

/**
* This service provides publish and subscribe mechanism for data.
*  -> Getting direct updates if the data changes on server side.
*  -> Publish changes on data to the server. 
*/
app.factory('PubSubService', function (WebSocketService) {

    var topicToSubscribers = {};

    /**
     * Subscribe to some topic. Multiple subscribers for one topic are possible.
     * 
     * @param {any} topic
     * @param {any} callback
     */
    this.subscribe = function (topic, callback) {

        if (typeof (topicToSubscribers[topic]) == 'undefined') {
            //Make an array so multiple subscribers can subscribe to one topic.
            topicToSubscribers[topic] = [];
        }        
        topicToSubscribers[topic].push(callback);
        var subscription = {
            type: "subscription",
            topic: topic
        };
        WebSocketService.send(subscription);
    };


    /**
     * Unsubscribe from topic.
     * 
     * @param {any} topic
     */
    this.unsubscribe = function (topic) {
        var unsubscription = {
            type: "unsubscription",
            topic: topic
        };
        WebSocketService.send(unsubscription);
        delete topicToSubscribers[topic];
    };

    /**
     * Publish data to the server.
     * 
     * @param {any} topic Topic to publish on.
     * @param {any} data Dont convert this to json -> Will be done by WebSocketService.
     */
    this.publish = function (topic, data) {
        var publishData = {
            type: "publish",
            topic: topic,
            data: data
        };
        WebSocketService.send(publishData);
    };

    //Register for incoming messages
    WebSocketService.registerOnMessageCallback(function (jsonMessage) {

        var message = JSON.parse(jsonMessage);
        if (message.type === "publish" && typeof topicToSubscribers[message.topic] != 'undefined') {
            topicToSubscribers[message.topic].forEach( function(callback) { 
                var data = message[message.topic];
                if (typeof callback != 'undefined') {
                    callback(data);
                } else {
                    self.unsubscribe(topic);
                }
            });            
        }
    });
    return this;
});