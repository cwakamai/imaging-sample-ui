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

    app.controller('ImageCtrl', ['$scope', '$route', '$q', 'ApiConnector', 'ResourceFactory', 'SystemConstants',
        function(scope, route, q, ApiConnector, ResourceFactory, SystemConstants) {

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

                if (!failOut){
                    ApiConnector.addImage(imageCollectionResource).then(function(result) {
                        if (result) {
                            // for each image in imageJob, runImageJob()
                            $.each(result.items, function(index, image) {
                                scope.runImageJob(image.id, rfwPolicyId, jobTag);
                            });

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
            };

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

            scope.checkKey = function(event, findBy, filterContent){
                if(event.keyCode == 13)
                    scope.getImages(findBy, filterContent);
            };

            scope.purgeImages = function(imagesToDelete) {
                if (imagesToDelete && imagesToDelete.length > 0) {
                    
                    var bulkImageUrls = imagesToDelete.split(/\r?\n/);
                    console.log(bulkImageUrls);
                    // ApiConnector.purge(bulkImageUrls);

                    alert("Images successfully purged");
                    scope.imageView = 'catalog';
                    scope.images = [];
                    scope.getImages('all', null);
                }
            };

            scope.getAllWarnErrors = function(){
                var allWarnErrors = [];
                var allPolicies = [];
                var queue = [];
                var uniqueImages = [];

                queue.push(ApiConnector.getAllPolicies().then(function(retRTpolicies){
                    $.each(retRTpolicies.items,function(index, rtPolicy){
                        allPolicies.push(rtPolicy.id);
                    });
                }));

                queue.push(ApiConnector.getRFWPolicies().then(function(retRFWpolicies){
                    $.each(retRFWpolicies.items,function(index, rfwPolicy){
                        allPolicies.push(rfwPolicy.id);
                    });
                }));

                q.all(queue).then(function(){
                    queue = [];

                    // Only try if there are images to have jobs in the first place
                    if (scope.images.length) {

                        $.each(allPolicies, function(index, policy){
                            console.log("policy to be got: ", policy);
                            queue.push(ApiConnector.getImageWithStatus(policy, 'FAILED')
                                .then(function(failedImageData){
                                            console.log(failedImageData);
                                            allWarnErrors.concat(failedImageData.items);
                                        },function(error){
                                            console.log("There was an error getting failed images", error);
                                        }));
                            queue.push(ApiConnector.getImageWithStatus(policy, 'WARNING')
                                .then(function(warnImageData){
                                            console.log(warnImageData);
                                            allWarnErrors.concat(warnImageData.items);
                                        },function(error){
                                            console.log("There was an error getting images with warnings", error);
                                        }));
                        });
                

                        q.all(queue).then(function(){
                            console.log(allWarnErrors);
                            if (null !== allWarnErrors && allWarnErrors.length) {
                                scope.images = allWarnErrors.items;

                                //Flatten array UNTESTED
                                $.each(scope.images, function(index, image){
                                    if($.inArray(image, uniqueImages) === -1) uniqueImages.push(image);
                                });

                                scope.images = uniqueImages;
                            }
                        });
                    }
                });
            };

            function init() {
                ApiConnector.RFWstatus().then(function(bool){
                    scope.rfwIsEnabled = bool;
                    scope.rfwPoliciesExist = bool;
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
                
                scope.getRFWPolicies();
            }

            init();

        }
    ]);
})();