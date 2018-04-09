var app = angular.module('Holistic.RoleService', ['Holistic.WebSocketService']);

/**
 * Service for requesting roles. 
 */
app.factory('RoleService', function (WebSocketService) {

    var roles = {};

    var requestRole = function (role) {

        if (!(role instanceof Role)) {
            throw new Error("Passed object is not a role object.");
        }
        var requestRole = {
            type: "role",
            role: role.name
        }
        roles[role.name] = role;
        WebSocketService.send(requestRole);
    };

    WebSocketService.registerOnMessageCallback(function (jsonMessage) {

        message = JSON.parse(jsonMessage);
        if (message.type === "role") {
            for (var key in roles) {
                //Only do something if registered for this role.
                if (message.role === key) {
                    switch (message.action) {
                        case "revoke":
                            roles[key].revokeRoleCallBack();
                            delete roles[key];
                            break;
                        case "data":
                            roles[key].receiveDataCallback(message.data);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    });

    /**
     * Removes all roles currently registered.
     * Does not call the revoke callback! 
     */
    this.resetRoles = function () {
        roles = {};
    };

    /**
     * The base role object.
     * 
     * @param {any} name Name of the role (e.g. 'timeMananger'')
     * @param {any} receiveDataCallback Callback for receiving data needed by this role.
     * @param {any} revokeRoleCallBack Callback which will be executed when the role is revoked.
     */
    function Role(name, receiveDataCallback, revokeRoleCallBack) {
        this.name = name;
        this.receiveDataCallback = receiveDataCallback;
        this.revokeRoleCallBack = revokeRoleCallBack;
        requestRole(this);
    };

    /**
     * Secretary role -> receives company strategy on data callback.
     * Has additional function for submitting the company strategy.
     * 
     * @param {any} receiveDataCallback See Role Object above.
     * @param {any} revokeRoleCallBack See Role Object above.
     * @returns
     */
    this.requestSecretaryRole = function (receiveDataCallback, revokeRoleCallBack) {
        var role = new Role("secretary", receiveDataCallback, revokeRoleCallBack);
        role.submitCompanyStrategy = function (companyStrategy) {
            var submitCompanyStrategy = {
                type: "submitCompanyStrategy",
                companyStrategy: companyStrategy
            };
            WebSocketService.send(submitCompanyStrategy);
        };
        return role;
    }

    /**
     * ResourceManager role -> Receives company / departments resources on data callback.
     * Has additional function for submitting resources changed by him.
     * 
     * @param {any} receiveDataCallback See Role Object above.
     * @param {any} revokeRoleCallBack See Role Object above.
     * @returns
     */
    this.requestResourceManagerRole = function (receiveDataCallback, revokeRoleCallBack) {
        var role = new Role("resourceManager", receiveDataCallback, revokeRoleCallBack);
        role.submitResources = function (departments) {
            var resourceSubmit = {
                type: "submitResources",
                departments: departments
            }
            WebSocketService.send(resourceSubmit);
        };
        return role;
    }

    /**
     * TimeManager role -> Will receive remaining time on data callback.
     * 
     * @param {any} receiveDataCallback See Role Object above.
     * @param {any} revokeRoleCallBack See Role Object above.
     * @returns
     */
    this.requestTimeManagerRole = function (receiveDataCallback, revokeRoleCallBack) {
        var role = new Role("timeManager", receiveDataCallback, revokeRoleCallBack);
        return role;
    }

    /**
     * ExpertDistributor role -> Receives available experts and currently assigned departments on data callback.
     * Has additional function for submitting expert distribution changed by him.
     * 
     * @param {any} receiveDataCallback See Role Object above.
     * @param {any} revokeRoleCallBack See Role Object above.
     * @returns
     */
    this.requestExpertDistributorRole = function (receiveDataCallback, revokeRoleCallBack) {
        var role = new Role("expertsDistributor", receiveDataCallback, revokeRoleCallBack);
        role.submitExpertDistribution = function (experts) {
            var expertsSubmit = {
                type: "submitExpertsDistribution",
                experts: experts
            }
            WebSocketService.send(expertsSubmit);
        };
        return role;
    }

    return this;
});