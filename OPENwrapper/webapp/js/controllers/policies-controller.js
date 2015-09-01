/*
 * policies-controller.js
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

    var app = angular.module('ImageManagementSample.controllers.policy', []);

    app.controller('PolicyCtrl', ['$scope', 'ApiConnector', 'SystemConstants', 'ResourceFactory',
        function(scope, ApiConnector, SystemConstants, ResourceFactory) {

            //LOCAL VARIABLES
            var validatedTransformations = [];
            var MAX_NUM_POLICIES = 32;

            //SCOPE FUNCTIONS

            //NAVIGATION
            scope.goStartPlan = function() {
                try {
                    validatedTransformations = ResourceFactory.validateAndCreateTransformResource(scope.transformSteps);
                    scope.currentStep = 0;
                } catch (errorMessages) {
                    alert(errorMessages.join().replace(/,/g, "\n"));
                }
            };

            // Go to the Add Transform step of create policy
            scope.goAddTransforms = function(policyId, url) {
                if (url) {
                    // This needs to be checked with a HEAD http request
                    scope.previewUrl = url;
                }
                if (scope.charsAreValid(policyId)) {
                    scope.getPolicies().then(function() {

                        scope.includablePolicies = [];
                        $.each(scope.userPolicies, function(index, policy) {
                            if (policy.id != policyId) {
                                scope.includablePolicies.push(policy);
                            }
                        });

                        if (validateMaxNumPolicies(scope.userPolicies, policyId)) {
                            alert("You have reached the maximum number of policies.");
                        } else {
                            scope.policyId = policyId;
                            previewPartialPolicy(ResourceFactory.validateAndCreateTransformResource(scope.transformSteps));
                            scope.currentStep = 1;
                        }
                    });
                } else {
                    console.log("invalid characters");
                }
            };

            // Go to the Set Resolutions step of create policy
            scope.goSetResolutions = function(transformSteps) {
                try {
                    validatedTransformations = ResourceFactory.validateAndCreateTransformResource(transformSteps);
                    scope.currentStep = 2;
                } catch (errorMessages) {
                    alert(errorMessages.join().replace(/,/g, "\n"));
                }
            };

            // Go to the Review step of create policy
            scope.goReviewPolicy = function(resolutions, output, qualityType) {
                if (qualityType==="pQuality") {
                    scope.policyOutput.pQuality = output;
                }

                if (resolutions) {
                    var errorMessages = [];

                    if (resolutions.widths && typeof resolutions.widths === 'string' && resolutions.widths.length > 0) {
                        resolutions.widths = resolutions.widths.replace(/[^0-9]/g, ' ').trim().replace(/\s+/g, ',');
                        if (resolutions.widths.split(',').length > 8) {
                            errorMessages.push("The maximum number of width allowed is 8.");
                        }
                    }

                    if (output) {
                        if (typeof output.quality === 'undefined' && output.pQuality === null) {
                            errorMessages.push("The quality is invalid.");
                        } else if (typeof output.pQuality === 'undefined' && output.quality === null) {
                            errorMessages.push("The perceptual quality is invalid.");
                        }
                    } else {
                        errorMessages.push("Missing policy outputs!");
                    }
                } else {
                    errorMessages.push("Missing resolutions!");
                }

                if (errorMessages.length > 0) {
                    alert(errorMessages.join().replace(/,/g, "\n"));
                } else {
                    scope.currentStep = 3;
                }
            };

            // Go to the create policy workflow
            scope.goCreatePolicy = function() {
                scope.policyView = 'createPolicy';
                scope.resetNewPolicyFields();
                scope.goStartPlan();
            };

            scope.goCreatePolicyFromBase = function(currentPolicy) {
                scope.policyView = 'createPolicy';
                populateNewPolicyFieldsWithBase(currentPolicy);
                scope.goStartPlan();
            };

            scope.goEditPolicy = function(currentPolicy) {
                scope.policyView = 'createPolicy';
                populateNewPolicyFieldsWithBase(currentPolicy);
                scope.goAddTransforms(currentPolicy.id, null);
            };

            scope.goPolicyCatalog = function() {
                scope.policyView = 'catalog';
                scope.currentPolicy = null;
            };

            scope.goPolicy = function(policyId) {
                scope.selectPolicy(policyId).then(function(policy) {
                    if (policy) {
                        scope.policyView = 'policy';
                    }
                });
            };

            // POLICY OPERATIONS
            scope.getPolicies = function() {
                return ApiConnector.getAllPolicies().then(function(policies) {
                    if (policies) {
                        scope.userPolicies = policies.items;
                    } else {
                        scope.userPolicies = null;
                    }
                });
            };

            scope.selectPolicy = function(policyId) {
                return ApiConnector.getPolicy(policyId).then(function(policy) {
                    if (policy) {
                        scope.currentPolicy = policy;
                    } else {
                        scope.currentPolicy = null;
                    }
                    return scope.currentPolicy;
                });
            };

            scope.removePolicy = function(policyId) {
                ApiConnector.deletePolicy(policyId).then(function(success) {
                    if (success) {
                        scope.getPolicies();
                    }
                });
            };

            scope.createPolicy = function() {
                if (scope.policyId !== null && !angular.isUndefined(scope.policyId)) {

                    var widths = [];
                    if (scope.policyResolutions.widths !== null && typeof scope.policyResolutions.widths === 'string' && scope.policyResolutions.widths !== "") {
                        widths = scope.policyResolutions.widths.split(",");
                    }

                    var resolutions = ResourceFactory.createPolicyResolutionResource(null, widths);

                    var defaults = ResourceFactory.createPolicyOutputsDefaultsResource(scope.policyOutput.quality, scope.policyOutput.pQuality, scope.policyOutput.qSelector);

                    var outputs = ResourceFactory.createOutputResource(defaults);

                    var policyResource = ResourceFactory.createPolicyResource(scope.policyId, validatedTransformations, resolutions, outputs);

                    ApiConnector.addPolicy(policyResource).then(function(success) {
                        scope.resetNewPolicyFields();
                        scope.currentStep = 4;
                    }, function(error) {
                        alert("Failed to create policy.\nServer returned HTTP " + error.status + ": " + error.data.detail);
                    });
                }
            };

            scope.policyDoesExist = function(policyId) {
                if (policyId) {
                    return findPolicyFromPoliciesArray(scope.userPolicies, policyId);
                }
                return false;
            };

            scope.charsAreValid = function(policyId){
                var re = /^\.auto$|^[A-Za-z0-9_-]*$/g;
                return (policyId && re.test(policyId));
            };

            scope.searchForPolicy = function(id){
                scope.userPolicies = [];
                
                ApiConnector.getPolicy(id).then(function(policies) {
                    if (Array.isArray(policies))
                        scope.userPolicies = policies;
                    else if (policies)
                        scope.userPolicies[0] = policies;
                });
            };

            // Setup for when creating a new policy and using another policy as base 
            function populateNewPolicyFieldsWithBase(basePolicy) {
                setNewPolicyConstants();

                // Replace the base transform step
                if (basePolicy.transformations && 0 < basePolicy.transformations.length) {

                    $.each(basePolicy.transformations, function(transformIndex, transform) {
                        var transformInput = null;
                        // Get the input format for each transform in the base policy and add it to the transform steps
                        $.each(scope.availableTransforms, function(inputIndex, input) {
                            if (transform.transformation === input.name) {
                                transformInput = input;
                            }
                        });

                        // when we find a transform in the base policy that we want to include, populate it with the original config values.
                        if (transformInput) {
                            $.each(transform, function(propertyName, value) {
                                if (transformInput.inputs){
                                    $.each(transformInput.inputs, function(inputIndex, input) {
                                        // Remove # from color hexcode
                                        if (transform.transformation === "BackgroundColor"){
                                            transform.color=transform.color.replace(/^./, '');
                                        }
                                        if (propertyName === input.name) {
                                            if (propertyName == 'image') {
                                                input.imageUrl = value.url;
                                                // not copying the composite policy because we currently have no reference to policy id
                                            } else {
                                                input.value = value;
                                            }
                                        }
                                    });
                                } else {
                                    transform.transformation === "Greyscale";
                                }
                            });

                            scope.transformSteps.push(transformInput);
                        }
                    });
                }

                if (basePolicy.resolutions && basePolicy.resolutions.widths) {
                    scope.policyResolutions.widths = basePolicy.resolutions.widths.toString();
                } else {
                    scope.policyResolutions = {
                        widths: null
                    };
                }

                if (basePolicy.outputs) {
                    if (basePolicy.outputs.defaults.quality){
                        scope.policyOutput.quality = basePolicy.outputs.defaults.quality;
                        scope.policyOutput.qSelector = 'quality';
                        scope.policyOutput.pQuality = null;
                    }else{
                        scope.policyOutput.pQuality = basePolicy.outputs.defaults.perceptualQuality;
                        scope.policyOutput.qSelector = 'pQuality';
                        scope.policyOutput.quality = null;
                    }
                }
            };

            // Setup for when creating a new policy fresh
            scope.resetNewPolicyFields = function() {
                setNewPolicyConstants();

                scope.policyResolutions = {
                    widths: null
                };

                scope.policyOutput = {
                    quality: 90,
                    pQuality: null,
                    qSelector: "quality",
                    browsers: true,
                    formats: true
                };
            };

            // adding a system transform to a policy's transformation
            scope.addTransformToPolicy = function(transform) {
                if (transform) {
                    var newTransform = {};
                    angular.copy(transform, newTransform);
                    scope.transformSteps.push(newTransform);
                }
            };

            // adding a user defined transform to a policy's transformation
            scope.addUserTransformToPolicy = function(userTransform) {
                if (userTransform) {
                    scope.selectPolicy(userTransform.id).then(function(policy) {
                        var transformPolicy = {
                            name: policy.id,
                            inputs: [{
                                type: "transform",
                                value: policy.transformations
                            }]
                        };
                        scope.transformSteps.push(transformPolicy);
                    });
                }
            };

            // removing a policy's transformation
            scope.removeTransformStep = function(index) {
                if (scope.transformSteps.length > 0) {
                    scope.transformSteps.splice(index, 1);
                }
            };

            // EVENT HANDLERS
            scope.onChangeOfDisablingCompositeScaling = function(compositeTransform) {
                if (!compositeTransform.inputs[4].value) {
                    compositeTransform.inputs[5].value = undefined;
                    compositeTransform.inputs[6].value = undefined;
                }
            };

            scope.onChangeOfBrowserPreset = function(browserPreset) {
                if (browserPreset) {
                    scope.policyOutput.browsers = false;
                } else {
                    scope.policyOutput.browsers = true;
                }
            };

            scope.onChangeOfFormatPreset = function(formatPreset) {
                if (formatPreset) {
                    scope.policyOutput.formats = false;
                } else {
                    scope.policyOutput.formats = true;
                }
            };

            scope.refreshPreview = function(transforms) {
                try {
                    scope.transformSteps = transforms;
                    previewPartialPolicy(ResourceFactory.validateAndCreateTransformResource(scope.transformSteps));
                } catch (errorMessages) {
                    alert(errorMessages.join().replace(/,/g, "\n"));
                }
            };

            // PREVIEW TRANSFORM

            scope.openPreview = function() {
                $("#preview").modal();
                scope.previewImageSrc = null;
                scope.isPreviewError = false;
                scope.isPreviewComplete = false;
                scope.previewUrl = null;
            };

            scope.previewFullPolicy = function(previewUrl, transformations) {
                scope.isPreviewComplete = false;
                var location = window.location;
                try{
                    var transformationsFinal = transformations.slice(0);
                    transformationsFinal.push({"transformation": "JPEG"});

                    var transformPlan = {
                        transformation: "Compound",
                        transformations: transformationsFinal
                    };

                    getPreviewImage(transformPlan, previewUrl)
                        .then(function(previewData) {
                            if (previewData) {
                                var type = previewData.headers('Content-Type');
                                var previewImage = new Image();
                                previewImage.onload = function() {
                                    scope.previewImageSrc = previewImage.src;
                                    scope.isPreviewError = false;
                                    scope.isPreviewComplete = true;
                                    scope.$apply();
                                };

                                previewImage.onerror = function() {
                                    scope.previewImageSrc = previewImage.src;
                                    scope.isPreviewError = true;
                                    scope.isPreviewComplete = true;
                                    scope.$apply();
                                };

                                previewImage.src = "data:" + type + ";base64," + previewData.data;
                                scope.previewUrl = null;
                            }
                        });
                }
                catch (error) {
                    if (!transformations)
                        alert("The policy you have attempted to preview has no transformations!\n\n");
                    else {
                        alert("There was an error with the previewing the policy you selected:\n\n" + error.toString());
                    }
                    console.log(error);
                }
            };

            // TODO: Update for IE 12
            scope.isIE = function() {
                var isIE = ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) !== null)));
                return isIE;
            };

            scope.goUploadPolicy = function() {
                console.log("file uploader0", fileUploader);
                console.log("0", scope.policyFile);
                $("#upload-policy").modal({
                    backdrop: "static"
                });
                scope.policyFile = null;
                console.log("0.5", scope.policyFile);
            };

            scope.uploadPolicy = function(policyFile) {
                try {
                    scope.policyFile = policyFile;
                    var newPolicyJson = angular.fromJson(scope.policyFile);
                    if (validateMaxNumPolicies(scope.userPolicies, newPolicyJson.id)) {
                        alert("You have reached the maximum number of policies.");
                    } else {
                        ApiConnector.addPolicy(newPolicyJson).then(function(success) {
                            if (success) {
                                scope.getPolicies();
                                scope.resetFileUpload();
                                $("#upload-policy").modal('hide');
                            }
                        }, function(error){
                            alert("There was an error: " + error);
                        });
                    }
                } catch (error){
                    alert("Please select a file with properly formatted JSON!");
                }
            };

            scope.resetFileUpload = function() {
                var fileUploader = $("#fileUploader");
                fileUploader.replaceWith(fileUploader.val('').clone(true));
            };

            scope.inputShouldBeDisplayed = function(input, transform) {
                if (transform.name === "Composite" && (input.name === "scale" || input.name === "scaleDimension")) {
                    return transform.inputs[4].value;
                } else {
                    return !!(input.name);
                }
            };

            scope.bothHeightAndWidthSpecified = function(resizeTransform) {
                var bothParamSpecified = resizeTransform.inputs[0].value && resizeTransform.inputs[1].value;
                if (!bothParamSpecified) {
                    resizeTransform.inputs[2].value = true;
                }
                return bothParamSpecified;
            };

            // LOCAL FUNCTIONS

            function setNewPolicyConstants() {
                scope.policyId =
                    scope.previewUrl =
                    scope.currentPolicy =
                    scope.transformToAdd =
                    scope.policyToAdd = null;

                scope.transformSteps = [];

                // Initialize the constants 
                scope.availableTransforms = angular.copy(SystemConstants.getSystemTransforms());
                scope.constructs = SystemConstants.getConstructs();
                scope.getPolicies();
            }

            function getPreviewImage(transformations, previewUrl) {
                return ApiConnector.preview(angular.toJson(transformations), previewUrl)
                    .then(function(previewData) {
                        return previewData;
                    }, function(errorData) {
                        alert(errorData.detail);
                    });
            }

            function previewPartialPolicy(transforms) {
                if (scope.previewUrl) {
                    var plan = [];

                    if (transforms !== null && typeof transforms != 'undefined') {
                        plan = transforms;                      
                        plan.push({"transformation": "JPEG"});
                    }

                    var transformPlan = {
                        transformation: "Compound",
                        transformations: plan
                    };

                    getPreviewImage(transformPlan, scope.previewUrl).then(function(previewData) {
                        scope.previewImageSrc = null;
                        if (previewData) {
                            var type = previewData.headers('Content-Type');
                            scope.previewImageSrc = "data:" + type + ";base64," + previewData.data;
                        }
                    });
                }
            }

            function validateMaxNumPolicies(existingPolicies, newPolicyId) {
                var maxPoliciesReached = false;
                if (existingPolicies && existingPolicies.length >= MAX_NUM_POLICIES) {
                    maxPoliciesReached = !findPolicyFromPoliciesArray(existingPolicies, newPolicyId);
                }
                return maxPoliciesReached;
            }

            function findPolicyFromPoliciesArray(policiesArray, targetPolicyId) {
                var policyFound = false;
                $.each(policiesArray, function(index, policy) {
                    if (policy.id == targetPolicyId) {
                        policyFound = true;
                    }
                });
                return policyFound;
            }

            function init() {
                scope.showUpload = false;
                scope.isPreviewError = false;
                scope.isPreviewComplete = false;

                scope.currentPolicy = null;
                scope.previewUrl = null;
                scope.policyResolutions = null;
                scope.policyOutput = null;
                scope.transformToAdd = null;
                scope.policyToAdd = null;
                scope.policyJsonData = null;
                scope.previewImageSrc = null;

                scope.currentStep = 0;
                scope.selectedTransforms = [];
                scope.policyView = 'catalog';

                scope.resetNewPolicyFields();
                scope.getPolicies();
            }
            init();
        }
    ]);
})();