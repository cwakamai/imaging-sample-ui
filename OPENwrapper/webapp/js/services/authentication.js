/*
 * authentication.js
 *
 * For more information visit https://developer.akamai.com
 *
 * License
 * Copyright 2015 Akamai Technologies, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
    'use strict';

    var app = angular.module('ImageManagementSample.services.auth', []).
    value('version', '2.0.1');


    app.factory('AuthService', ['$http', '$location', '$route', 'Configuration',
        function(http, location, route, config) {
            var lunaToken = null;
            var contractId = "akamai";

            return {
                getLunaToken: function() {
                    return lunaToken;
                },
                setLunaToken: function(newLunaToken) {
                    http.defaults.headers.common['Luna-Token'] = newLunaToken;
                    http.defaults.headers.common['x-aws-customer'] = contractId;
                    http.defaults.headers.common['Content-Type'] = "application/json";

                    lunaToken = newLunaToken;
                },
                removeLunaToken: function(newLunaToken) {
                    delete http.defaults.headers.common['Luna-Token'];
                    delete http.defaults.headers.common['x-aws-customer'];
                    delete http.defaults.headers.common['Content-Type'];

                    lunaToken = null;
                },
                getContractId: function() {
                    return contractId;
                },
                goToLandingPage: function() {
                    http.get(config.getApiHost() + 'imaging/v0/netstorage')
                        .then(function(successData) {
                            route.current.scope.__proto__.isRFWEnabled = true;
                        },function(error){
                            route.current.scope.__proto__.isRFWEnabled = false;
                        }).finally(function(){
                            location.path('/images');
                            route.reload();
                        });

                    delete route.current.scope.__proto__.isRFWEnabled;
                },
                goToLoginPage: function() {
                    location.path('/login');
                    route.reload();
                }
            };
        }
    ]);
})();
 
