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
    value('version', '2.0.1');

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

// IMAGES
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
                        return errorData;
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

// JOBS
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

// STATUSES
            this.getImageWithStatus = function(policyId, status) {
                if (policyId && status){
                    return http.get(config.getApiHost() + 'imaging/v0/images?policyId=' + policyId + '&status=' + status)
                        .then(function(successData){
                            return successData.data;
                        }, function(errorData){
                            console.log("error", errorData.data)
                            return errorData.data;
                        }
                    );
                } else {
                    alert("You need both policyId and status to get images with a status policyId: " + policyId + " status: " + status);
                }
            };

            this.getImageStatus = function(imageId){
                return http.get(config.getApiHost() + 'imaging/v0/images/' + imageId)
                    .then(function(successData) {
                        return successData.data.policies['.auto'].status;
                    }, function(errorData) {
                        throw errorData.data;
                    });
            };

// PURGE
            // Expects the purge Id returned from a successful edge purge request
            this.getEdgePurgeStatus = function(purgeId){
                return http.get(config.getApiHost() + 'ccu/v2/purges/' + purgeId)
                    .then(function(success){
                        return success.data.purgeStatus;
                    },function(error){
                        return error.data;
                    });
            };

            // Expects an array of Image URLs
            this.edgePurge = function(imageUrls){
                var purgeObj = {
                    'objects' : imageUrls
                };

                return http.post(config.getApiHost() + 'ccu/v2/queues/default', purgeObj)
                    .then(function(success){
                        return success.data;
                    },function(fail){
                        return fail.data;
                    });
            };

            // Expects an array of Image Ids
            this.apiPurge = function(imageIds) {
                var purgeObj = {
                    'imageIds' : imageIds
                };
                return http.post(config.getApiHost() + 'imaging/v0/images/purge', purgeObj)
                    .then(function(successData){
                        return successData.data;
                    }, function(error){
                        return error.data;
                    });
            };

// ORDERED IMAGE COLLECTION
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
                return http.put(config.getApiHost() + 'imaging/v0/imagecollections/' + imageCollectionJson.id, imageCollectionJson)
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

// POLICIES
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
                return http.get(config.getApiHost() + 'imaging/v0/preview',
                    {
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

            this.previewCheck = function(url){
                return http.head(url).then(
                    function(successData){
                        return successData;
                    },function(errorData){
                        console.log("Could not do head request.", errorData);
                    }
                );
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

// READY FOR WEB
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

// READY FOR WEB POLICIES
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
//CONFIGURATION
            this.getConf = function(){
                return http.get("creds")
                    .then(function(successData) {
                        return successData.data;
                    }, function(error) {
                        return null;
                    });
            };

        }
    ]);
})();