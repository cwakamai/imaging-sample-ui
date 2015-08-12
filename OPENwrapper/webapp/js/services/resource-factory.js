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
    value('version', '1.0');

    app.factory('ResourceFactory', function() {
        return {
// IMAGES
            createImageResource: function(url, id, tags, products) {
                var imageResource = {
                    url: url,
                    id: id,
                    tags: tags,
                    products: products
                };
                return imageResource;
            },
            createImageSetResource: function(imageResources) {
                var imageSetResource = {
                    items: imageResources,
                    totalItems: imageResources.length,
                    itemKind: "IMAGE"
                };

                return imageSetResource;
            },
// IMAGE COLLECTIONS
            createImageCollectionResource: function(id, tags, definition, imageIds){
                var imageCollectionResource = {
                    id: id,
                    tags: tags,
                    definition: definition,
                    imageIds: imageIds
                };
                return imageCollectionResource;
            },
            createIcDefinitionResource: function(type, items){
                var itemsArray = [];
                $.each(items.items, function(index, item) {
                    var image = {
                        type: "AkaImage",
                        imageId: item.id
                    };
                    itemsArray.push(image);
                });

                var icDefinition = {
                    type: type,
                    items: itemsArray,
                };
                return icDefinition;
            },
// JOBS
            createProductJobResource: function(viewerName, productIds, policyIds) {
                var jobProductResource = {
                    viewerName: viewerName,
                    productIds: productIds,
                    policyIds: policyIds
                };
                return jobProductResource;
            },
            createImageJobResource: function(imageIds, policyId) {
                var jobImageResource = {
                    imageIds: imageIds,
                    policyId: policyId
                };
                return jobImageResource;
            },
// POLICIES
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
                var policySetResource = {
                    totalItems: policyResources.length,
                    itemKind: "POLICY",
                    items: policyResources
                };
                return policySetResource;
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
            createPolicyOutputsDefaultsResource: function(quality, perceptualQuality, qSelector) {
                if (qSelector == "pQuality"){
                    var policyOutputsDefaultsResource = {
                        perceptualQuality: perceptualQuality
                    };
                } else{
                    var policyOutputsDefaultsResource = {
                        quality: quality
                    };
                }

                return policyOutputsDefaultsResource;
            },
            createOutputResource: function(defaults) {
                var policyOutputResource = {
                    defaults: defaults
                };
                return policyOutputResource;
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
                var color = "";

                $.each(transformSteps, function(index, transformStep) {

                    var transform = {
                        transformation: transformStep.name
                    };
                    
                    if (transformStep.inputs) {
                        $.each(transformStep.inputs, function(index, input) {
                            if (input.type === "int" || input.type === "intResize" || input.type === "booleanResize" || input.type === "booleanComposite" || input.type === "options") {
                                if (null !== input.value || typeof input.value !== "undefined" || !isNaN(input.value)) {
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
                                // The check is performed to interpret 0 as true
                                if (null !== input.value && typeof input.value !== "undefined" && !isNaN(input.value)) {
                                    if (input.minInclusive) {
                                        if (input.value <= input.max && input.value >= input.min) {
                                            transform[input.name] = input.value;
                                        } else {
                                            console.log("The " + input.name + " in " + transform.transformation + " is invalid. ", input.value, input.min, input.max);
                                            invalidInputMessages.push("The " + input.name + " in " + transform.transformation + " is invalid. ");
                                        }
                                    } else {
                                        if (input.value <= input.max && input.value >= input.min) {
                                            transform[input.name] = input.value;
                                        } else {
                                            console.log("The " + input.name + " in " + transform.transformation + " is invalid. ", input.value, input.min, input.max);
                                            invalidInputMessages.push("The " + input.name + " in " + transform.transformation + " is invalid.");
                                        }
                                    }
                                } else if (input.required) {
                                    console.log("The " + input.name + " in " + transform.transformation + " is not there. ", input.value, input.min, input.max);
                                    invalidInputMessages.push("The " + input.name + " in " + transform.transformation + " is not there. ");
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
                            if (input.type === "color") {
                                // Make sure it's a valid color value 000000-FFFFFF
                                if (input.value && /^([0-9a-fA-F]{3}){1,2}$/g.test(input.value)) {
                                    color = "#"+input.value;
                                    transform[input.name] = color;
                                } else {
                                    invalidInputMessages.push("The color in " + transform.transformation + " is invalid. Please provide a 3 or 6 character HEX value from 000000 to FFFFFF");
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
                    // If it is not the special case of the no-input command Grayscale then it is invalid
                    } else if (transformStep.name !== "Grayscale")
                        invalidInputMessages.push("The transformation " + transformStep.name + " does not have any inputs!");

                    if (invalidInputMessages.length === 0 && transform !== null) {
                        // No error, so the image needed to be added to the compsite transformer arguments as well
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