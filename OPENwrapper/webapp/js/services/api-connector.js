/*
 * api-connector.js
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
    var app = angular.module('ImageManagementSample.services.api', []).
    value('version', '0.1');

    // Service definition
    app.service('ApiConnector', ['$http', 'AuthService', 'Configuration',

        function(http, auth, config) {
            // LUNA TOKEN VALIDATION
            this.verifyLunaToken = function(lunaToken) {
                return http.get(config.getApiHost() + 'imaging/v0/policies', {
                        headers: {
                            'Luna-Token': lunaToken,
                            'x-aws-customer': auth.getContractId(),
                            'Content-Type': "application/json"
                        }
                    })
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return errorData.data;
                    });
            };

            // IMAGES API
            this.getAllImages = function() {
                return http.get(config.getApiHost() + 'imaging/v0/images')
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.getImagesByUrl = function(url) {
                return http.get(config.getApiHost() + 'imaging/v0/images', {
                        params: {
                            "url": url
                        }
                    })
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.getImagesByTags = function(tags) {
                return http.get(config.getApiHost() + 'imaging/v0/images', {
                        params: {
                            tag: tags
                        }
                    })
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.getImage = function(imageId) {
                return http.get(config.getApiHost() + 'imaging/v0/images/' + imageId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        throw errorData.data;
                    });
            };

            this.addImage = function(imageCollectionResource) {
                return http.post(config.getApiHost() + 'imaging/v0/images', angular.toJson(imageCollectionResource))
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.removeImage = function(imageId) {
                return http.delete(config.getApiHost() + 'imaging/v0/images/' + imageId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.getImageTags = function(imageId) {
                return http.get(config.getApiHost() + 'imaging/v0/images/' + imageId + '/tags')
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.addTagsToImage = function(imageId, imageResource) {
                return http.post(config.getApiHost() + 'imaging/v0/images/' + imageId + '/tags', angular.toJson(imageResource))
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.removeAllTagsFromImage = function(imageId) {
                return http.delete(config.getApiHost() + 'imaging/v0/images/' + imageId + '/tags')
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.removeTagFromImage = function(imageId, tag) {
                return http.delete(config.getApiHost() + 'imaging/v0/images/' + imageId + '/tags/' + tag)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            // PRODUCTS API
            this.getProduct = function(productId) {
                return http.get(config.getApiHost() + "imaging/v0/products/" + productId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.getAllProducts = function() {
                return http.get(config.getApiHost() + "imaging/v0/products")
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.getProductsByName = function(name) {
                return http.get(config.getApiHost() + "imaging/v0/products", {
                        params: {
                            name: name
                        }
                    })
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.getProductsByTags = function(tags) {
                return http.get(config.getApiHost() + "imaging/v0/products", {
                        params: {
                            tags: tags
                        }
                    })
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.createProduct = function(productCollectionResource) {
                return http.post(config.getApiHost() + "imaging/v0/products", productCollectionResource)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.removeProduct = function(productId) {
                return http.delete(config.getApiHost() + "imaging/v0/products/" + productId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };


            this.getProductTags = function(productId) {
                return http.get(config.getApiHost() + "imaging/v0/products/" + productId + "/tags")
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.addTagToProduct = function(productId, productResource) {
                return http.post(config.getApiHost() + "imaging/v0/products/" + productId + "/tags", angular.toJson(productResource))
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.removeTagFromProduct = function(productId, tagName) {
                return http.delete(config.getApiHost() + "imaging/v0/products/" + productId + "/tags/" + tagName)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.removeAllTagsFromProduct = function(productId) {
                return http.delete(config.getApiHost() + "imaging/v0/products/" + productId + "/tags")
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        throw errorData.data;
                    });
            };

            this.getProductImageIds = function(productId) {
                return http.get(config.getApiHost() + "imaging/v0/products/" + productId + "/imageIds")
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.addImageIdsToProduct = function(productId, productResource) {

                return http.post(config.getApiHost() + "imaging/v0/products/" + productId + "/imageIds", angular.toJson(productResource))
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.removeAllImagesFromProduct = function(productId) {

                return http.delete(config.getApiHost() + "imaging/v0/products/" + productId + "/imageIds")
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.removeImageFromProduct = function(imageId, productId) {
                return http.delete(config.getApiHost() + "imaging/v0/products/" + productId + "/imageIds/" + imageId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            // JOBS API
            this.getJobs = function() {
                return http.get(config.getApiHost() + 'imaging/v0/jobs')
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            this.performJobAction = function(jobId, action) {
                if (jobId !== null && action !== null) {
                    return http.post(config.getApiHost() + 'imaging/v0/jobs', {
                            params: {
                                jobId: jobId,
                                action: action
                            }
                        })
                        .then(function(successData) {
                            return successData.data;
                        }, function(error) {
                            return null;
                        });
                } else {
                    return null;
                }
            };

            this.getJob = function(jobId) {
                return http.get(config.getApiHost() + 'imaging/v0/jobs/' + jobId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            this.addJob = function(jobResource) {
                return http.post(config.getApiHost() + 'imaging/v0/jobs', angular.copy(jobResource))
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            this.getJobItems = function(jobId) {
                return http.get(config.getApiHost() + 'imaging/v0/jobs/' + jobId + '/items')
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            this.getJobErrorItems = function(jobId) {
                return http.get(config.getApiHost() + 'imaging/v0/jobs/' + jobId + '/errors')
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            //PREVIEW API
            this.previewImageTransformation = function(imageSrc, planJson) {
                return http.get(config.getApiHost() + 'imaging/v0/preview', {
                    params: {
                        src: imageSrc,
                        plan: planJson
                    }
                }).then(function(successData) {
                    return successData.data;
                }, function(error) {
                    return null;
                });
            };

            // POLICIES API
            this.getAllPolicies = function() {
                return http.get(config.getApiHost() + 'imaging/v0/policies')
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            this.getPolicy = function(policyId) {
                return http.get(config.getApiHost() + 'imaging/v0/policies/' + policyId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            this.addPolicy = function(policyResource) {
                return http.put(config.getApiHost() + 'imaging/v0/policies/' + policyResource.id, angular.toJson(policyResource))
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        throw error;
                    });
            };

            this.deletePolicy = function(policyId) {
                return http.delete(config.getApiHost() + 'imaging/v0/policies/' + policyId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            this.getAllPolicyHistory = function() {
                return http.get(config.getApiHost() + 'imaging/v0/policies/history')
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            this.getPolicyHistory = function(policyId) {
                return http.get(config.getApiHost() + 'imaging/v0/policies/history/' + policyId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            this.addPolicyHistory = function(policyId, policyLogResource) {
                return http.post(config.getApiHost() + 'imaging/v0/policies/history/' + policyId, policyLogResource)
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            // PREVIEW
            this.preview = function(plan, url) {
                return http.post(config.getApiHost() + 'imaging/v0/preview/encode', null, {
                        params: {
                            src: url,
                            plan: plan
                        }
                    })
                    .then(function(successData) {
                        return successData;
                    }, function(errorData) {
                        throw errorData.data;
                    });
            };

        }
    ]);
})();