/*
 * job-controller.js
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

    var app = angular.module('ImageManagementSample.controllers.job', []);

    app.controller('JobsCtrl', ['$scope', '$filter', 'ApiConnector', 'ResourceFactory', 'SystemConstants',
        function(scope, filter, ApiConnector, ResourceFactory, SystemConstants) {

            // NAVIGATION
            scope.goCreateJob = function() {
                clearInterval(scope.processinginterval);

                scope.selectedProducts = [];
                scope.selectedPolicies = [];
                scope.selectedImages = [];

                getPolicies();
                if (SystemConstants.getIsProductEnabled()) {
                    getProducts();
                }

                scope.newJob = {
                    type: 'image',
                    addImage: null,
                    addProduct: null,
                    addPolicy: null,
                    viewerName: null
                };
                
                scope.jobView = 'createJob';
            };

            scope.goListJobs = function() {
                clearInterval(scope.processinginterval);
                scope.jobView = 'jobList';
                init();
            };

            scope.changeFilter = function(jobType){
                scope.jobType = jobType;
            }

            scope.goViewJob = function(job) {
                scope.jobView = 'detailJob';
                scope.currentJob = job;
                scope.showProgress = false;

                scope.getJobItems(scope.currentJob);

                if (job.percentComplete != 100) {
                    scope.showProgress = true;

                    scope.processingInterval = getJobProgress(job);

                }
            };
            
            scope.getJobItems = function(job) {
                ApiConnector.getJobItems(job.id).then(function(jobItems) {
                    scope.currentJobItems = [];
                    scope.currentJobItems = jobItems.items;
                });
            };

            scope.addProductToJob = function(product) {
                var index = 0;
                var isAdded = false;
                // Check that 
                while (!isAdded && index < scope.products.length) {
                    if (scope.products[index].id === product.id) {
                        scope.products.splice(index, 1);
                        scope.selectedProducts.push(product);
                        isAdded = true;
                    }
                    index++;
                }
            };

            scope.removeProductFromJob = function(index) {
                scope.selectedProducts.splice(index, 1);
            };

            scope.addPolicyToJob = function(policy) {
                var index = 0;
                var isAdded = false;
                // Check that 
                while (!isAdded && index < scope.policies.length) {
                    if (scope.policies[index].id === policy.id) {
                        scope.policies.splice(index, 1);
                        scope.selectedPolicies.push(policy);
                        isAdded = true;
                    }
                    index++;
                }
            };

            scope.removePolicyFromJob = function(index) {
                var removedPolicy = scope.selectedPolicies.splice(index, 1);
                scope.policies.push(removedPolicy[0]);
                scope.newJob.addPolicy = null;
            };

            scope.addJob = function(newJob) {
                var policyIds = [];
                var imageIds = [];
                var productIds = [];
                var job = null;

                if (newJob.type === 'product' && null !== newJob.viewerName || newJob.type === 'image') {
                    $.each(scope.selectedPolicies, function(index, policy) {
                        policyIds.push(policy.id);
                    });

                    if (newJob.type === 'image') {
                        $.each(scope.selectedImages, function(index, image) {
                            imageIds.push(image.id);
                        });
                        job = ResourceFactory.createImageJobResource(imageIds, policyIds);
                    }

                    if (newJob.type === 'product') {
                        $.each(scope.selectedProducts, function(index, product) {
                            productIds.push(product.id);
                        });
                        job = ResourceFactory.createProductJobResource(newJob.viewerName, productIds, policyIds);
                    }
                    scope.itemsPassed = 0;
                    scope.itemsPending = 0;
                    scope.itemsFailed = 0;

                    ApiConnector.addJob(job).then(function(operation) {
                        ApiConnector.getJob(operation.id).then(function(job) {
                            scope.goViewJob(job);
                        });
                    });
                } else {
                    // need a viewer name
                }
            };

            // PRIVATE FUNCTIONS

            function getPolicies() {
                scope.policies = [];
                ApiConnector.getAllPolicies().then(function(policyIds) {
                    if (policyIds !== null) {
                        $.each(policyIds.items, function(index, policyId) {
                            ApiConnector.getPolicy(policyId.id).then(function(policyResource) {
                                scope.policies.push(policyResource);
                            });
                        });

                        if (policyIds.items.length === 0) {
                            scope.policies.push({
                                id: "None"
                            });
                        }
                    }
                });
            }

            function getProducts() {
                if (scope.isProductEnabled) {
                    scope.products = [];
                    ApiConnector.getAllProducts().then(function(productIds) {
                        if (productIds !== null) {
                            $.each(productIds.items, function(index, productId) {
                                ApiConnector.getProduct(productId.id).then(function(productResource) {
                                    scope.products.push(productResource);
                                });
                            });

                            if (productIds.items.length === 0) {
                                scope.products.push({
                                    name: "None"
                                });
                            }
                        }
                    });
                }
            }

            function init() {
                scope.jobView = 'jobList';
                scope.jobs = [];
                scope.currentJob = null;
                scope.currentJobItems = [];
                scope.jobType = !(scope.jobType) ? "all" : scope.jobType;
                scope.processinginterval = null;
                scope.isProductEnabled = SystemConstants.getIsProductEnabled();
            }

            init();

            function getJobProgress(jobResource) {
                var processinginterval = setInterval(function() {
                    ApiConnector.getJob(jobResource.id).then(function(job) {
                        if (job !== null) {

                            scope.getJobItems(job);

                            scope.itemsPassed = 0;
                            scope.itemsPending = 0;
                            scope.itemsFailed = 0;

                            for (var i = 0, j = job.statuses.length; i < j; i++) {
                                if (job.statuses[i].status === "PENDING") {
                                    scope.itemsPending = job.statuses[i].count;
                                } else if (job.statuses[i].status === "PASSED") {
                                    scope.itemsPassed = job.statuses[i].count;
                                } else if (job.statuses[i].status === "FAILED") {
                                    scope.itemsFailed = job.statuses[i].count;
                                }
                            }

                            if (job.percentComplete == 100) {
                                clearInterval(processinginterval);
                            }
                        }
                    });
                }, 2000);

                return processinginterval;
            }

        }
    ]);

})();