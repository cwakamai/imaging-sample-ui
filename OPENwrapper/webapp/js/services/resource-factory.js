/*
 * resource-factory.js
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

    var app = angular.module('ImageManagementSample.services.resource', []).
    value('version', '0.1');

    app.factory('ResourceFactory', function() {
        return {
            createImageResource: function(url, id, tags, products) {
                var imageResource = {
                    url: url,
                    id: id,
                    tags: tags,
                    products: products
                };
                return imageResource;
            },
            createImageCollectionResource: function(imageResources) {
                var imageCollectionResource = {
                    items: imageResources,
                    totalItems: imageResources.length,
                    itemKind: "IMAGE"
                };

                return imageCollectionResource;
            },
            createProductResource: function(id, name, imageIds, tags) {
                var productResource = {
                    id: id,
                    name: name,
                    imageIds: imageIds,
                    tags: tags,
                };
                return productResource;
            },
            createProductCollectionResource: function(productResources) {
                var productCollectionResource = {
                    items: productResources,
                    totalItems: productResources.length,
                    itemKind: "PRODUCT"
                };

                return productCollectionResource;
            },
            createProductJobResource: function(viewerName, productIds, policyIds) {
                var jobProductResource = {
                    viewerName: viewerName,
                    productIds: productIds,
                    policyIds: policyIds
                };
                return jobProductResource;
            },
            createImageJobResource: function(imageIds, policyIds) {
                var jobImageResource = {
                    imageIds: imageIds,
                    policyIds: policyIds
                };
                return jobImageResource;
            },
            createPolicyResource: function(id, transformations, resolutions, outputs) {
                var policyResource = {
                    id: id
                };

                if (transformations && transformations.length > 0) {
                    policyResource.transformations = transformations;
                }

                if (resolutions) {
                    policyResource.resolutions = resolutions;
                }

                if (outputs) {
                    policyResource.outputs = outputs;
                }

                return policyResource;
            },
            createPolicyCollectionResource: function(policyResources) {
                var policyCollectionResource = {
                    totalItems: policyResources.length,
                    itemKind: "POLICY",
                    items: policyResources
                };
                return policyCollectionResource;

            },
            createPolicyResolutionResource: function(interpolation, widths) {
                var policyResolutionResource = {};
                if (interpolation) {
                    policyResolutionResource.interpolation = interpolation;
                }

                if (widths && widths.length > 0) {
                    policyResolutionResource.widths = widths;
                }

                if($.isEmptyObject(policyResolutionResource)){
                    return null;
                }

                return policyResolutionResource;

            },
            createOutputResource: function(defaults, presets, definitions) {
                var policyOutputResource = {
                    defaults: defaults, // 
                    presets: presets, // either/both Browsers and Formats
                    definitions: definitions
                };
                return policyOutputResource;
            },
            createPolicyOutputsDefaultsResource: function(quality, minSubSampling, desiredSubSampling) {
                var policyOutputsDefaultsResource = {
                    quality: quality,
                    minSubSampling: minSubSampling,
                    desiredSubSampling: desiredSubSampling
                };
                return policyOutputsDefaultsResource;
            },
            createPolicyLogResource: function(id, policy, user) {
                var policyLogResource = {
                    id: id,
                    policy: policy,
                    user: user
                };

                return policyLogResource;

            },
            validateAndCreateTransformResource: function(transformSteps) {
                if (transformSteps === undefined) transformSteps = [];

                var policyTransforms = [];
                var invalidInputMessages = [];

                $.each(transformSteps, function(index, transformStep) {

                    var transform = {
                        transformation: transformStep.name
                    };

                    $.each(transformStep.inputs, function(index, input) {
                        if (input.type === "int" || input.type === "intResize" || input.type === "booleanResize" || input.type === "booleanComposite" || input.type === "options") {
                            if (input.value) {
                                transform[input.name] = input.value;
                            } else if (input.required) {
                                if (transformStep.name === 'Resize' && transformStep.inputs[Math.abs(index - 1)].value) {
                                    transform[input.name] = input.value;
                                } else {
                                    invalidInputMessages.push("The " + input.name + " in " + transform.transformation + " is invalid. ");
                                }
                            }
                        }
                        if (input.type === "float") {
                            // The check is perform to interpret 0 as true
                            if (null !== input.value && typeof input.value !== "undefined" && !isNaN(input.value)) {
                                if (input.minInclusive) {
                                    if (input.value <= input.max && input.value >= input.min) {
                                        transform[input.name] = input.value;
                                    } else {
                                        invalidInputMessages.push("The " + input.name + " in " + transform.transformation + " is invalid. ");
                                    }
                                } else {
                                    if (input.value <= input.max && input.value > input.min) {
                                        transform[input.name] = input.value;
                                    } else {
                                        invalidInputMessages.push("The " + input.name + " in " + transform.transformation + " is invalid. ");
                                    }
                                }
                            } else if (input.required) {
                                invalidInputMessages.push("The " + input.name + " in " + transform.transformation + " is invalid. ");
                            }
                        }
                        if (input.type === "image") {
                            if (input.imageUrl) {
                                transform[input.name] = {
                                    url: input.imageUrl
                                };
                            } else {
                                invalidInputMessages.push("The image URL in " + transform.transformation + " is invalid. ");
                            }
                        }
                        if (input.type === "transform") {
                            if (input.value && input.value.length > 0) {
                                transform.transformation = "Compound";
                                transform.transformations = input.value;
                            } else {
                                transform = null;
                            }
                        }
                    });

                    if (invalidInputMessages.length === 0 && transform !== null) {
                        // No error, so the image needed to be added to the compsite transofmr arguments as well
                        policyTransforms.push(transform);
                    }
                });

                if (invalidInputMessages.length === 0) {
                    return policyTransforms;
                } else {
                    throw invalidInputMessages;
                }
            }
        };
    });
})();