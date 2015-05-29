/*
 * readyforweb-setup-controller.js
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

    var app = angular.module('ImageManagementSample.controllers.rfwsetup', []);

    app.controller('RFWSetupCtrl', ['$scope', '$route', 'ApiConnector', 'SystemConstants',
        function(scope, route, ApiConnector, SystemConstants) {
            
            var editing = false;
            var rfwInfo = {};
        	
            scope.verify = function(fresh_rfwInfo){
        		ApiConnector.registerRFW(fresh_rfwInfo)
                    .then(function(successData) {
                        confirmRFWdata();
                    }, function(error) {
                        alert(error);
                    });
        	};

            scope.deleteRFW = function(){
                ApiConnector.deleteRFW().then(function(data){
                    if (data.title == "Bad Request")
                        alert(data.detail);
                    else {
                        rfwInfo = {};
                        scope.isRFWEnabled = false;
                        scope.$parent.isRFWEnabled = false;
                        route.reload();
                    }
                });
            };

            function confirmRFWdata(){
                ApiConnector.RFWstatus().then(function(rfwStatus){
                    scope.isRFWEnabled = rfwStatus;
                });

                ApiConnector.getRFW().then(function(rfwData) {
                    if (rfwData) {
                        scope.rfwInfo = rfwData;
                        scope.rfwInfo.rootDirectory = parseInt(rfwData.rootDirectory);
                    }
                }, function(error) {
                    alert(error);
                });
            }

            function init(){
                confirmRFWdata();
			}

            init();
        }
        
    ]);
})
();