var app = angular.module('Holistic.GameServices', ['Holistic.WebSocketService']);
/**
 * Service for general actions in the game
 */
app.factory('GameService', function ($q, WebSocketService) {

    /**
     * Wrapper around creation of a promise, registering it in the WebSocketservice and sending data to the server.
     * 
     * @param {any} promiseName
     * @param {any} message The message which will be processed by the server which then sends back the requested data
     *                      or executes some action.
     * @returns promise
     */
    var registerPromise = function (promiseName, message) {
        var deferred = $q.defer();
        WebSocketService.registerPromise(promiseName, deferred);
        WebSocketService.send(message);
        return deferred.promise;
    };

    /**
     * Normale user registration.
     * 
     * @param {any} barcode The barcode of the department for which the user will be registered.
     * @returns promise
     */
    this.registerAsNormalUser = function (barcode) {
        var userAction = {
            type: "user",
            barcode: barcode
        };
        return registerPromise("user", userAction);
    };

    /**
     * The current user will be registered as consultant.
     * 
     * @param {any} barcode Special barcode for consultants.
     * @returns promise
     */
    this.registerAsConsultant = function (barcode) {
        var consultantAction = {
            type: "consultant",
            barcode: barcode
        };
        return registerPromise("consultant", consultantAction);
    };

    /**
     * Async request for department data of the scanned barcode.
     * 
     * @param {any} barcode
     * @returns promise
     */
    this.getDepartment = function (barcode) {
        var getDepartmentData = {
            type: "departmentData",
            barcode: barcode
        };
        return registerPromise("department", getDepartmentData);
    };

    /**
     * Async request for all available research topics.
     * 
     * @param {any} companyId Id of the company for which research topics will be requested.
     * @param {any} departmentId Id of the department for which research topics will be requested.
     * @returns promise
     */
    this.getResearchTopics = function (companyId, departmentId) {
        var researchTopics = {
            type: "researchTopics",
            companyId: companyId,
            departmentId: departmentId
        }
        return registerPromise("researchTopics", researchTopics);
    };
    
    /**
     * 
     * @param {any} companyId Company for which research should be done.
     * @param {any} departmentId Department for which research should be done.
     * @param {any} topicId Topic that should be researched.
     * @param {any} rolledValue The value rolled. -> Server decides if research is successful or not.
     */
    this.research = function (companyId, departmentId, topicId, rolledValue) {
        var researchAction = {
            type: "research",
            companyId: companyId,
            departmentId: departmentId,
            topicId: topicId,
            rolledValue: rolledValue
        };
        WebSocketService.send(researchAction);
    };

    this.markMailAsSeen = function(mailId){
        var seenAction = {
            type: "markMailAsSeen",
            mailId: mailId
        };
        WebSocketService.send(seenAction);
    }

    this.getNewBoughtStrategies = function(){
        var newBoughtStrategies = {
            type: "newBoughtStrategies"
        }
        return registerPromise("newBoughtStrategies", newBoughtStrategies);
    }

    this.updateConsultantToDo = function(todo_id){
        var consultantToDo = {
            type: "consultantToDo",
            todoId: todo_id
        }
         WebSocketService.send(consultantToDo);
    }

    this.getStrategyWithDependencies = function(barcode){
        var getStrategyWithDependencies = {
            type: "getStrategyWithDependencies",
            barcode: barcode
        }
        return registerPromise("strategyWithDependencies",getStrategyWithDependencies);
    }
    return this;
});

