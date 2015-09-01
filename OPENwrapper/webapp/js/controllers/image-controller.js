/*
 * image-controller.js
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

    var app = angular.module('ImageManagementSample.controllers.image', []);

    app.controller('ImageCtrl', ['$scope', '$route', '$q', '$timeout', 'ApiConnector', 'ResourceFactory', 'SystemConstants',
        function(scope, route, q, timeout, ApiConnector, ResourceFactory, SystemConstants) {

// NAVIGATION
            scope.goAddImages = function() {
                scope.imageView = 'add';
            };

            scope.goCatalogView = function() {
                scope.imageView = 'catalog';
                scope.images = [];
                scope.getImages('all', null);
            };

            scope.goMassDelete = function() {
                scope.imageView = "delete";
                scope.images = [];
                scope.getImages('all', null);
            };

            scope.goBulkPurge = function(){
                scope.imageView = 'purge';
                scope.purging = false;
            };

// IMAGES
            scope.resetAddImageFields = function() {
                scope.addImageFields = {
                    newImageId: null,
                    newImageUrl: null,
                    newBulkUrls: null,
                    newTag: null
                };
            };

            scope.addImage = function(addImageFields) {
                var tags = null;
                var imageUrl = addImageFields.newImageUrl;
                var imageId = addImageFields.newImageId === '' ? undefined : addImageFields.newImageId;
                var rfwPolicyId = !addImageFields.hasOwnProperty('rfwPolicy') ? undefined : addImageFields.rfwPolicy.id;
                var bulkImageUrls = [];
                var imageResources = [];
                var imageCollectionResource = {};
                var jobTag = "";
                var failOut = false;

                if (addImageFields.newTag) {
                    tags = addImageFields.newTag.replace(/\s+/g, '').split(",");
                }

                if (addImageFields.newRFWTag){
                    if (addImageFields.newRFWTag.match(/^[a-zA-Z]*$/)[0].length !== addImageFields.newRFWTag.length) {
                        alert("Tags can only be a single alphabetic word");
                        failOut = true;
                    }
                    else
                        jobTag = addImageFields.newRFWTag;
                }

                if (addImageFields.newImageUrl) {
                    imageResources.push(ResourceFactory.createImageResource(imageUrl, imageId, tags));
                }

                if (addImageFields.newBulkUrls) {
                    bulkImageUrls = addImageFields.newBulkUrls.split(/\r?\n/);
                    // Parse the Image URLs
                    $.each(bulkImageUrls, function(index, url) {
                        imageResources.push(ResourceFactory.createImageResource(url, undefined, tags));
                    });
                }

                imageCollectionResource = ResourceFactory.createImageSetResource(imageResources);

                if (!!rfwPolicyId) {
                    imageCollectionResource.rfwPolicyId = rfwPolicyId;
                }

                if (!failOut){
                    ApiConnector.addImage(imageCollectionResource).then(function(result) {
                        if (result) {
                            scope.resetAddImageFields();
                            scope.goCatalogView();
                        } else {
                            alert("ERROR: Unable to add image(s)");
                        }
                    });
                }
            };

            scope.getImages = function(findBy, filterContent) {
                scope.catalogLoading = true;
                var newImages = [];

                // check the content has no errors or is defined 
                if (!angular.isUndefined(filterContent)) {
                    if ('all' === findBy) {
                        ApiConnector.getAllImages().then(function(imageData) {
                            if (imageData !== null) {
                                scope.images = imageData.items;
                            }
                        });

                    } else if ('tag' === findBy) {
                        ApiConnector.getImagesByTags(filterContent)
                            .then(function(imageIds) {
                                if (imageIds !== null) {
                                    $.each(imageIds.items, function(index, imageResource) {
                                        newImages.push(ApiConnector.getImage(imageResource.id));
                                    });
                                    q.all(newImages).then(function(images) {
                                        scope.images = images;
                                    });
                                }
                            },function(error){
                                scope.images = [];
                            });
                    } else if ('id' === findBy) {
                        ApiConnector.getImage(filterContent)
                            .then(function(imageResource) {
                                if (imageResource !== null) {
                                    scope.images = [imageResource];
                                }
                            },function(error){
                                scope.images = [];
                            });
                    } else if ('url' === findBy) {
                        ApiConnector.getImagesByUrl(filterContent)
                            .then(function(imageIds) {
                                if (imageIds !== null) {
                                    $.each(imageIds.items, function(index, imageResource) {
                                        newImages.push(ApiConnector.getImage(imageResource.id));
                                    });
                                    q.all(newImages).then(function(images) {
                                        scope.images = images;
                                    });
                                }
                            },function(error){
                                scope.images = [];
                            });
                    } else {
                        // shouldn't get here, do nothing
                    }
                }
            };

            scope.selectAllImages = function() {
                if (scope.isProductEnabled) {
                    for (var i = 0, j = scope.images.length; i < j; i++) {
                        scope.images[i].selected = true;
                    }
                }
            };

            scope.deselectAllImages = function() {
                if (scope.isProductEnabled) {
                    for (var i = 0, j = scope.images.length; i < j; i++) {
                        scope.images[i].selected = false;
                    }
                }
            };

// POLICIES
            scope.getRFWPolicies = function() {
                return ApiConnector.getRFWPolicies().then(function(retrievedPolicies) {
                    if (retrievedPolicies) {
                        scope.rfwPolicies = retrievedPolicies.items;
                        scope.rfwPolicies.splice(0, 1); // Get rid of .rfw, it will be run on the image anyway
                    } else {
                        scope.rfwPolicies = null;
                    }
                });
            };

// JOBS
            scope.runImageJob = function(imagesIds, rfwPolicyId, jobTag) {
                if (rfwPolicyId)
                    ApiConnector.runImageJob(imagesIds, rfwPolicyId, jobTag);
            };

            scope.getJob = function(policyId) {
                ApiConnector.getJob(policyId).then(function(data){
                    return data;
                },function(error){
                    console.log("Error ", error);
                    return null;
                });
            };

// SEARCH
            scope.checkKey = function(event, findBy, filterContent){
                if(event.keyCode == 13)
                    scope.getImages(findBy, filterContent);
            };

// PURGE
            scope.purgeImages = function(imagesToPurge) {
                if (!!imagesToPurge) {
                    scope.purgingStatus = [];
                    var 
                        ids = [],
                        imagesArray = [],
                        ep1Urls = [],
                        idsToGet = [],
                        statusesToCheck = [],
                        imageStatusObjects = [];

                    var tempUrl = '', firstCall = true;
                    var bulkImageUrls = imagesToPurge.split(/\r?\n/);
                    if (bulkImageUrls.length > 500) {
                        alert("There is a limit of 500 images per purge");
                        return;
                    }
                    // TODO remove duplicates

                    for (var u of bulkImageUrls){
                        tempUrl = parseUri(u);
                        if (!!tempUrl.host && !!tempUrl.path) {
                            ApiConnector.getImagesByUrl(u)
                                .then(function(images){
                                    ids.push(images.items[0].id);
                                    imagesArray.push(images.items[0]);
                                });
                            if (!tempUrl.query) {
                                ep1Urls.push(u+"?imbypass=true");
                            } else {
                                ep1Urls.push(u+"&imbypass=true");
                            }
                        } else {
                            scope.purgingStatus += "Removing invalid url from purge: " + u + ". ";
                            bulkImageUrls.splice(bulkImageUrls.indexOf(u), 1);
                        }
                    }

                    if (bulkImageUrls.length < 1) {
                        alert("You must submit at least one valid url to purge");
                        return;
                    }

                    scope.purgingStatus.push(new Date() + " Purging pristine images. ");

                    // Switch UI view
                    scope.purging = true;

                    var checkEP1 = function(success){
                        // Make sure we actually got a success
                        if (success.httpStatus !== 201){
                            scope.purgingStatus.push(new Date() + " Purge was rejected with status " + success.httpStatus + ", " + success.title);
                            alert(new Date() + " Purge was rejected with status " + success.httpStatus + ", " + success.title);
                            return;
                        }

                        if (firstCall){
                            scope.purgingStatus.push(new Date() + " Pristine/origin purge request " + success.purgeId 
                                + " submitted successfully. Expected completion time of: " + success.estimatedSeconds + "s. ");
                            firstCall = false;
                        }
                        
                        timeout(function(){return ApiConnector.getEdgePurgeStatus(success.purgeId);}, 30000)
                            .then(function(status){
                                if (status !== "Done"){
                                    scope.purgingStatus.push(new Date() + " Checking pristine purge status, status was: " + status + ". ");
                                    checkEP1(success);
                                } else {
                                    scope.purgingStatus.push(new Date() + " Pristine Purge complete: " + success.purgeId + ". ");
                                    
                                    // Call API PURGE
                                    ApiConnector.apiPurge(ids)
                                        .then(function(apiPurgeReceipt){
                                            if (apiPurgeReceipt.operationPerformed !== "CREATED"){
                                                alert("There was a problem submitting the Netstorage purge request. " 
                                                    + apiPurgeReceipt.data);
                                            } else {
                                                firstCall = false;
                                                scope.purgingStatus.push(new Date() + " Netstorage purge submitted successfully. ");
                                                scope.purgingStatus.push("Waiting for API purge to complete... ");
                                                
                                                ids.forEach(function(id, i) {
                                                    statusesToCheck.push(checkAPI(id));
                                                });
                                                
                                                var left = 0;
                                                var apiChecker = setInterval(function(){
                                                    left = Math.abs(statusesToCheck.length - ids.length);
                                                    scope.purgingStatus.push(new Date() + " " + left + "/" + ids.length + " images purged. ");
                                                    
                                                    q.all(statusesToCheck).then(function(){
                                                        if (statusesToCheck.length === 0){
                                                            scope.purgingStatus.push(new Date() + " Finished checking netstorage statuses! ");
                                                            clearInterval(apiChecker);
                                                            ApiConnector.edgePurge(bulkImageUrls).then(checkEP2);
                                                        }
                                                    });
                                                    
                                                }, 30000);
                                            }
                                        });
                                }
                            });
                    }

                    var checkAPI = function(id) {
                        return ApiConnector.getImageStatus(id)
                            .then(function(status){
                                if (status === "PURGED" || isTimestampDifferent(id, imagesArray)){   // TODO Timestamp Difference Check
                                    scope.purgingStatus.push(new Date() + " Image " + id + " has been purged from netstorage. ");
                                    statusesToCheck.splice(statusesToCheck.indexOf(id), 1);
                                } else {
                                    statusesToCheck.splice(statusesToCheck.indexOf(id), 1, checkAPI(id));
                                }
                            });
                    };

                    var checkEP2 = function(success){
                        if (firstCall){
                            scope.purgingStatus.push(new Date() + " Derivative purge request " 
                                + success.purgeId 
                                + " submitted successfully. Expected completion time of: " 
                                + success.estimatedSeconds + "s.");
                            firstCall = false;
                        }

                        timeout(function(){
                                return ApiConnector.getEdgePurgeStatus(success.purgeId);
                            }, 30000)
                            .then(function(status){
                                if (status !== "Done"){
                                    scope.purgingStatus.push(new Date() + " Checking derivative purge status, status was: " 
                                        + status + " ");
                                    checkEP2(success);
                                } else {
                                    scope.purgingStatus.push(new Date() + " Derivative Purge complete: " + success.purgeId + ". ");
                                    scope.purgingStatus.push(" PURGING COMPLETE!");
                                }
                            });
                    };

                    // Begin Purge
                    ApiConnector.edgePurge(ep1Urls).then(checkEP1);
                } else {
                    alert("Please include some image URLs to purge");
                }
            };

            scope.checkPurgeStatus = function() {
                ApiConnector.getEdgePurgeStatus().then(
                    function(data){
                        console.log(data);
                    }
                );
            };

// FUNCTIONS
            // parseUri 1.2.2 (c) Steven Levithan <stevenlevithan.com>
            // MIT License
            function parseUri(r){for(var e=parseUri.options,o=e.parser[e.strictMode?"strict":"loose"].exec(r),s={},t=14;t--;)s[e.key[t]]=o[t]||"";return s[e.q.name]={},s[e.key[12]].replace(e.q.parser,function(r,o,t){o&&(s[e.q.name][o]=t)}),s}parseUri.options={strictMode:!1,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};
            parseUri.options={strictMode:!1,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};

            function isTimestampDifferent(id, imagesArray){
                ApiConnector.getImage(id).then(function(oldImage){
                    for (var image of imagesArray){
                        if ((image.id == id) && (oldImage.policies == image.policies))
                            return false;
                    }
                    return true;

                }, function(error){
                    console.log("was unable to get image to check timestamp");
                });
            }

            function init() {
                ApiConnector.RFWstatus().then(function(bool){
                    scope.rfwIsEnabled = bool;
                    scope.rfwPoliciesExist = bool;
                });

                ApiConnector.getConf().then(function(data){
                    scope.purgeEnabled = data;
                });

                scope.rfwPolicies = [];

                scope.resetAddImageFields();
                scope.addImagesWithIds = true;
                scope.bulkPurging = false;
                scope.getImages('all', null);
                scope.images = [];
                scope.imageView = 'catalog';
                scope.findBy = 'all';
                scope.filterContent = null;
                scope.selectedImage = null;
                scope.purging = false;
                scope.purgingStatus = '';
                
                scope.getRFWPolicies();
            }

            init();
        }
    ]);
})();