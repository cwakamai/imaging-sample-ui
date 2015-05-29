/*
 * imagecollection-controller.js
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

    var app = angular.module('ImageManagementSample.controllers.imagecollection', []);

    app.controller('ImageCollectionCtrl', ['$scope', 'ApiConnector', 'SystemConstants', 'ResourceFactory',
        function(scope, ApiConnector, SystemConstants, ResourceFactory) {

            scope.resetICFields = function() {
                scope.icContainer = {};
                scope.icContainer.id    = scope.icContainer.json
                scope.filteredImages    = null;
                scope.icView = "catalog";
                scope.getAllImageCollections();
                //scope.getFilteredImages('all','');
            };

            // NAVIGATION
            scope.goStartPlan = function() {
                try {
                    scope.currentStep = 0;
                    setNewImageCollectionConstants();
                } catch (errorMessages) {
                    alert(errorMessages.join().replace(/,/g, "\n"));
                }
            };

            scope.goViewImageCollections = function() {
                scope.icView = "catalog";
                scope.getAllImageCollections();
            };

            scope.goPasteImageCollection = function() {
                scope.icView = "pasteCollection";
            };

            scope.goCreateImageCollection = function() {
                scope.icView = "createCollection";
                scope.currentStep=0;
                setNewImageCollectionConstants();
            };

            scope.goUploadImageCollection = function() {
                $("#upload-image-collection").modal({
                    backdrop: "static"
                });
                scope.imageCollectionFile = null;
            };

            scope.viewImageCollection = function (imageCollectionID) {
                scope.selectImageCollection(imageCollectionID).then(function(imagecollection) {
                    if (imagecollection) {
                        scope.icView = 'viewImageCollection';
                    }
                });
            };

            scope.goBackToId = function () {
                scope.IcId = scope.currentImageCollection.id;
                scope.currentStep=0;
            };

            scope.goBackToAddImages = function () {
                scope.currentStep=2;
            }

            scope.goChooseType = function(imageCollectionID) {
                if (!imageCollectionID) {
                    alert("Please add an Image Collection ID to continue");
                } else {
                    scope.currentImageCollection.icId = imageCollectionID;
                    scope.currentStep = 1;
                }
            };

            scope.goBackToType = function () {
                scope.imageCollectionID = scope.currentImageCollection.id;
                scope.currentStep = 1;
            };

            scope.goAddImagesToIC = function (icType, icTags) {
                if (!icType) {
                    alert("You must select a type to continue");
                } else {
                    if (icTags){
                        scope.currentImageCollection.icTags = icTags.split(",");
                        // Grab only unique and correct tags
                        scope.currentImageCollection.icTags = scope.currentImageCollection.icTags
                            .filter(function(n){return n != "";})
                            .sort()
                            .filter(function(item, pos, ary) {
                                return !pos || item != ary[pos - 1];
                            });
                    }
                    scope.currentImageCollection.icType = icType;
                    scope.currentStep = 2;
                }
            };

            scope.goReviewNewIC = function (urls) {
                scope.addNewImagesToCollection(urls);
                scope.currentStep=3;
            };

            scope.goReviewIC = function(filteredImages){
                scope.addExistingImagesToImageCollection(filteredImages);
                scope.currentStep=3;
            };

            scope.goCompleteIC = function () {
                scope.createImageCollection();
                scope.currentStep=4;
            };

            scope.createImageCollection = function () {
                var imageCollectionResource = 
                    ResourceFactory.createImageCollectionResource(scope.currentImageCollection.icId,
                        scope.currentImageCollection.icTags,
                        scope.currentImageCollection.definition,
                        scope.currentImageCollection.imageIds);

                    ApiConnector.addImageCollection(imageCollectionResource);
            };

            scope.selectImageCollection = function(imageCollectionID) {
                return ApiConnector.getImageCollection(imageCollectionID).then(function(imagecollection) {
                    if (imagecollection) {
                        scope.currentImageCollection = imagecollection;
                    } else {
                        scope.currentImageCollection = null;
                    }
                    return scope.currentImageCollection;
                });
            };

            // API OPERATIONS
            scope.getAllImageCollections = function () {
                ApiConnector.getAllImageCollections().then(function(imageCollectionData) {
                    if (imageCollectionData) {
                        scope.userImageCollections = imageCollectionData.items;
                    } else {
                        scope.userImageCollections = null;
                    }
                });
            };

            scope.getFilteredImages = function(findBy, searchTag) {
                scope.filteredImages = [];

                // check the content has no errors or is defined 
                if ('all' === findBy) {
                    ApiConnector.getAllImages().then(function(imageIds) {
                        if (imageIds !== null) {
                            $.each(imageIds.items, function(index, imageResource) {
                                scope.filteredImages.push(imageResource);
                            });
                        }
                    });

                } else if ('tag' === findBy) {
                    ApiConnector.getImagesByTags(searchTag)
                        .then(function(imageIds) {
                            if (imageIds !== null) {
                                $.each(imageIds.items, function(index, imageResource) {
                                    ApiConnector.getImage(imageResource.id).then(function(imageResource) {
                                        scope.filteredImages.push(imageResource);
                                    });
                                });
                            }
                        });
                } else if ('id' === findBy) {
                    ApiConnector.getImage(searchTag)
                        .then(function(imageResource) {
                            if (imageResource !== null) {
                                scope.filteredImages.push(imageResource);
                            }
                        });
                } else if ('url' === findBy) {
                    ApiConnector.getImagesByUrl(searchTag)
                        .then(function(imageIds) {
                            if (imageIds !== null) {
                                $.each(imageIds.items, function(index, imageResource) {
                                    ApiConnector.getImage(imageResource.id).then(function(imageResource) {
                                        scope.filteredImages.push(imageResource);
                                    });
                                });
                            }
                        });
                }
            };

            scope.addImageCollection = function() {
                if (scope.icContainer.json !== null) {
                    try {
                        scope.imageCollectionResource = JSON.parse(scope.icContainer.json);
                    } catch(err) {
                        alert("Improperly formatted JSON data\n" + err);
                        return;
                    }

                    ApiConnector.addImageCollection(scope.imageCollectionResource).then(function(result) {
                        if (result) {
                            scope.resetICFields();
                        } else {
                            alert("ERROR: Unable to add image collection(s)");
                        }
                    });
                }
            };

            scope.addImageCollectionFromJson = function(icJson) {

                    scope.imageCollectionResource = icJson;

                    ApiConnector.addImageCollection(scope.imageCollectionResource).then(function(result) {
                        if (result) {
                            scope.resetICFields();
                            // TODO navigate to success page
                        } else {
                            alert("ERROR: Unable to add image collection(s)");
                        }
                    });
            };

            scope.addNewImagesToCollection = function(urls) {
                if (urls) {
                    var imageResources = [];
                    var imageCollectionResource = null;
                    var imageUrls = urls.split(/\r\n|\r|\n/g);

                    $.each(imageUrls, function(index, url) {
                        var imageResource = ResourceFactory.createImageResource(url);
                        imageResources.push(imageResource);
                    });
                    
                    return ApiConnector.addImage(ResourceFactory.createImageSetResource(imageResources)).then(function(images) {
                        var imageIds = [];
                        
                        $.each(images.items, function(index, image) {
                            imageIds.push(image.id);
                        });
                        scope.currentImageCollection.imageIds = imageIds;
                        
                        scope.currentImageCollection.definition = ResourceFactory.createIcDefinitionResource(scope.currentImageCollection.icType, images);
                        
                    }, function(errorData) {
                        alert(errorData.detail);
                    });
                }
            };

            scope.addExistingImagesToImageCollection = function(filteredImages){
                // Add check to make sure they have chosen images, else error
                var imageIds = [];
                
                $.each(filteredImages, function(index, image) {
                    imageIds.push(image.id);
                });

                scope.currentImageCollection.imageIds = imageIds;

                scope.currentImageCollection.definition = ResourceFactory.createIcDefinitionResource(scope.currentImageCollection.icType, {items:filteredImages});
            };

            scope.removeImageCollection = function (imageCollectionID) {
                ApiConnector.removeImageCollection(imageCollectionID).then(function(success) {
                    if (success) {
                        scope.getAllImageCollections();
                    }
                });
            };

            scope.imageCollectionExists = function(imageCollectionID) {
                var toReturn = false;
                if (imageCollectionID && scope.userImageCollections.length > 0) {
                    toReturn = findImageCollectionFromICArray(scope.userImageCollections, imageCollectionID);
                }
                return toReturn;
            };

            scope.uploadImageCollection = function(imageCollectionFile) {
                scope.imageCollectionFile = imageCollectionFile;
                var newImageCollectionJson = angular.fromJson(scope.imageCollectionFile);

                ApiConnector.addImageCollectionFromJson(newImageCollectionJson).then(function(success) {
                    if (success) {
                        scope.resetFileUpload();
                        $("#upload-image-collection").modal('hide');
                    }
                });
            };

            scope.resetFileUpload = function() {
                var fileUploader = $("#fileUploader");
                fileUploader.replaceWith(fileUploader.val('').clone(true));
            };

            function setNewImageCollectionConstants() {
                scope.currentImageCollection = {};

                scope.currentImageCollection.icId =
                    scope.currentImageCollection.icType = 
                    scope.currentImageCollection.newImageUrls =
                    scope.currentImageCollection.imageIds =
                    scope.currentImageCollection.icTags = 
                    scope.currentImageCollection.colors = null;

                // Initialize the constants 
                scope.icTypes = angular.copy(SystemConstants.getIcTypes());
            }

            function findImageCollectionFromICArray(imageCollectionsArray, targetImageCollectionID) {
                var imageCollectionFound = false;

                imageCollectionsArray.forEach(function(imageCollection, index, array){
                    if (imageCollection.id == targetImageCollectionID) {
                        imageCollectionFound = true;
                    }
                });

                return imageCollectionFound;
            }

            function init(){
                scope.currentStep = 0;
                scope.resetICFields();
                scope.getAllImageCollections();
			}

            init();
        }
    ]);
})();