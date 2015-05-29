/*
 * auth-controller.js
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

    var app = angular.module('ImageManagementSample.controllers.auth', []);

    app.controller('AuthCtrl', ['$scope', 'AuthService', 'ApiConnector',
        function(scope, AuthService, ApiConnector) {

            scope.lunaToken = null;

            scope.login = function(lunaToken) {
                ApiConnector.verifyLunaToken(lunaToken).then(function(responseWapper) {
                    if (responseWapper.requestSuccess) {
                        AuthService.setLunaToken(lunaToken);
                        AuthService.goToLandingPage();
                    } else {
                        if (responseWapper.response.data && responseWapper.response.data.detail) {
                            alert(responseWapper.response.data.detail);
                        } else {
                            alert("An unexpected error occurred! \nPlease check your browser console for error detail.");
                        }
                    }
                });
            };
        }
    ]);

})();