/*
 * app.js
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

    angular.module('ImageManagementSample', [
        'ngRoute',
        'ImageManagementSample.filters',
        'ImageManagementSample.config',
        'ImageManagementSample.services.api',
        'ImageManagementSample.services.system',
        'ImageManagementSample.services.auth',
        'ImageManagementSample.services.resource',
        'ImageManagementSample.directives',
        'ImageManagementSample.controllers.auth',
        'ImageManagementSample.controllers.nav',
        'ImageManagementSample.controllers.rfwsetup',
        'ImageManagementSample.controllers.rfwpolicies',
        'ImageManagementSample.controllers.policy',
        'ImageManagementSample.controllers.image',
        'ImageManagementSample.controllers.imagecollection'
    ]).
    config(['$routeProvider', '$compileProvider',
        function(routeProvider, compileProvider) {

            // Retrieves or overrides the default regular expression that is used for whitelisting of safe urls during a[href] sanitization.
            compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|data):/);

            routeProvider.when('/images', {
                templateUrl: 'partials/images.html',
                controller: 'ImageCtrl'
            });

            routeProvider.when('/imagecollections', {
                templateUrl: 'partials/imagecollections.html',
                controller: 'ImageCollectionCtrl'
            });

            routeProvider.when('/policy', {
                templateUrl: 'partials/policies.html',
                controller: 'PolicyCtrl'
            });

            routeProvider.when('/rfwsetup', {
                templateUrl: 'partials/rfwSetup.html',
                controller: 'RFWSetupCtrl'
            }); 

            routeProvider.when('/rfwpolicies', {
                templateUrl: 'partials/rfwPolicies.html',
                controller: 'RFWPoliciesCtrl'
            });            

            routeProvider.when('/login', {
                templateUrl: 'partials/login.html'
            });

            routeProvider.otherwise({
                redirectTo: '/login'
            });
        }
    ]).run(function($rootScope, $location) {
        $rootScope.location = $location;
        $location.path('/login');
    });

})();
