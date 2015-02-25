/*
 * navigation-controller.js
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

    var app = angular.module('ImageManagementSample.controllers.nav', []);

    app.controller('NavigationCtrl', ['$scope', '$location', '$route', 'SystemConstants', 'Configuration', 'AuthService',
        function(scope, location, route, SystemConstants, config, AuthService) {

            scope.isProductEnabled = SystemConstants.getIsProductEnabled();
            scope.versionNo = config.getVersion();

            scope.getHeading = function() {
                if (location.path() === '/images') {
                    return "Images";
                } else if (location.path() === '/policy') {
                    return "Image Transform Policies";
                } else if (scope.isProductEnabled && location.path() === '/products') {
                    return "Products";
                } else if (location.path() === '/login') {
                    return "Log In";
                } else if (location.path() === '/jobs') {
                    return "Jobs";
                } else {
                    //do nothing, should be above options
                    return null;
                }
            };

            scope.toggleMobileMenu = function() {
                $('#mobile-menu').removeClass('hidden');
                if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 768) {
                    $('#mobile-menu').css('margin-top', '155px');
                }
                $('#main-content').css('padding-top', '0px');

                $("#mobile-menu").collapse('toggle');


                $('#mobile-menu').on('hidden.bs.collapse', function() {
                    $('#mobile-menu').addClass('hidden');
                    if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 768) {
                        $('#main-content').css('padding-top', '150px');
                    } else {
                        $('#main-content').css('padding-top', '100px');
                    }
                });
            };

            scope.goImages = function() {
                location.path('/images');
                route.reload();
            };

            scope.goPolicyCreator = function() {
                location.path('/policy');
                route.reload();
            };

            scope.goJobs = function() {
                location.path('/jobs');
                route.reload();

            };

            scope.goProducts = function() {
                if (scope.isProductEnabled) {
                    location.path('/products');
                    route.reload();
                }
            };

            scope.logOut = function() {
                AuthService.removeLunaToken();
                AuthService.goToLoginPage();
            }
        }
    ]);
})();