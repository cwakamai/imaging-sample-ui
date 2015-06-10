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
    app.service('ApiConnector', ['$q','$http', 'AuthService', 'Configuration',

        function(q, http, auth, config) {
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
                        return { 
                            requestSuccess: true,
                            response: successData.data
                        };
                    }, function(errorData) {
                        return {
                            requestSuccess: false,
                            response: errorData
                        };
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

            this.addImage = function(imageResource) {
                return http.post(config.getApiHost() + 'imaging/v0/images', angular.toJson(imageResource))
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

            this.runImageJob = function(images, policyId, jobTag) {
                var job = {};
                job.imageIds = images;
                job.policyId = policyId;
                job.tag = jobTag;
                return http.post(config.getApiHost() + "imaging/v0/images/run", job)
                    .then(function(successData){
                        return successData.data;
                    },function(errorData){
                        return null;
                    });
            };

            this.getJob = function(policyID) {

                return http.get(config.getApiHost() + 'imaging/v0/images?policyId=' + policyID)
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            // Ordered Image Collection API
            this.getAllImageCollections = function() {
                return http.get(config.getApiHost() + 'imaging/v0/imagecollections')
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.getImageCollection = function(imageCollectionId) {
                return http.get(config.getApiHost() + 'imaging/v0/imagecollections/' + imageCollectionId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        throw errorData.data;
                    });
            };

            this.addImageCollection = function(imageCollectionResource) {
                return http.put(config.getApiHost() + 'imaging/v0/imagecollections/' + imageCollectionResource.id, angular.toJson(imageCollectionResource))
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.addImageCollectionFromJson = function(imageCollectionJson) {
                return http.post(config.getApiHost() + 'imaging/v0/imagecollections', imageCollectionJson)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
                        return null;
                    });
            };

            this.removeImageCollection = function(imageCollectionId) {
                return http.delete(config.getApiHost() + 'imaging/v0/imagecollections/' + imageCollectionId)
                    .then(function(successData) {
                        return successData.data;
                    }, function(errorData) {
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

            // RFW
            this.registerRFW = function(rfwInfo){
                return http.put(config.getApiHost() + 'imaging/v0/netstorage', rfwInfo)
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

            this.getRFW = function(){
                return http.get(config.getApiHost() + 'imaging/v0/netstorage')
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };
           
            this.deleteRFW = function(){
                return http.delete(config.getApiHost() + 'imaging/v0/netstorage')
                .then(function(successData) {
                    return successData.data;
                }, function(error) {
                    return null;
                });
            };

            this.RFWstatus = function(){
                var deferred = q.defer();
                
                this.getRFW().then(function(data){
                    deferred.resolve(!!data);
                }, function (error){
                    deferred.reject(error);
                });
                
                return deferred.promise;
            };

            // RFW POLICIES
            this.getRFWPolicies = function(){
                return http.get(config.getApiHost() + 'imaging/v0/policies/rfw')
                .then(function(successData) {
                    return successData.data;
                }, function(error) {
                    return null;
                });
            };

            this.getRFWPolicy = function(rfwPolicyID){
                return http.get(config.getApiHost() + 'imaging/v0/policies/rfw/' + rfwPolicyID)
                .then(function(successData) {
                    return successData.data;
                }, function(error) {
                    return null;
                });
            };

            this.addRFWPolicy = function(rfwPolicyResource){
                return http.put(config.getApiHost() + 'imaging/v0/policies/rfw/' + rfwPolicyResource.id, angular.toJson(rfwPolicyResource))
                .then(function(successData) {
                    return successData.data;
                }, function(error) {
                    return null;
                });
            };

            this.deleteRFWPolicy = function(rfwPolicyID){
                return http.delete(config.getApiHost() + 'imaging/v0/policies/rfw/' + rfwPolicyID)
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };


        }
    ]);
})();