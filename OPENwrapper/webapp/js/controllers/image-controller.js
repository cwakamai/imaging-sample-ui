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

    app.controller('ImageCtrl', ['$scope', '$q', 'ApiConnector', 'ResourceFactory', 'SystemConstants',
        function(scope, q, ApiConnector, ResourceFactory, SystemConstants) {

            scope.resetAddImageFields = function() {
                scope.addImageFields = {
                    newImageId: null,
                    newImageUrl: null,
                    newBulkUrls: null,
                    newTag: null
                };
            };

            scope.resetAddImageFields();

            scope.addImage = function(addImageFields) {
                var tags = null;
                var imageUrl = addImageFields.newImageUrl;
                var imageId = addImageFields.newImageId === '' ? undefined : addImageFields.newImageId;
                var bulkImageUrls = [];
                var imageResources = [];
                var imageCollectionResource = {};

                if (addImageFields.newTag) {
                    tags = addImageFields.newTag.split(",");
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

                imageCollectionResource = ResourceFactory.createImageCollectionResource(imageResources);

                ApiConnector.addImage(imageCollectionResource).then(function(result) {
                    if (result) {
                        scope.resetAddImageFields();
                        scope.goCatalogView();
                    } else {
                        alert("ERROR: Unable to add image(s)");
                    }
                });
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
                            });
                    } else if ('id' === findBy) {
                        ApiConnector.getImage(filterContent)
                            .then(function(imageResource) {
                                if (imageResource !== null) {
                                    scope.images = [imageResource];
                                }
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

            scope.addImagesToProduct = function(product) {
                var imageIds = [];
                var i = 0;
                var j = scope.images.length;

                if (scope.isProductEnabled) {
                    for (i = 0; i < j; i++) {
                        if (scope.images[i].selected) {
                            imageIds.push(scope.images[i].id);
                        }
                    }

                    var productResource = ResourceFactory.createProductResource(product.id, product.name, imageIds);
                    ApiConnector.addImageIdsToProduct(product.id, productResource);

                    for (i = 0; i < j; i++) {
                        if (scope.images[i].selected) {
                            scope.images[i].selected = false;
                        }
                    }
                }
            };

            scope.goAddImages = function() {
                scope.imageView = 'add';
            };

            scope.goCatalogView = function() {
                scope.imageView = 'catalog';
                scope.images = [];
            };

            function init() {
                scope.addImagesWithIds = true;
                scope.images = [];
                scope.imageView = 'catalog';
                scope.findBy = 'all';
                scope.filterContent = null;
                scope.selectedImage = null;
                scope.isProductEnabled = SystemConstants.getIsProductEnabled();

                if (scope.isProductEnabled) {
                    scope.products = [];
                    ApiConnector.getAllProducts().then(function(productIds) {
                        if (productIds !== null) {
                            $.each(productIds.items, function(index, product) {
                                ApiConnector.getProduct(product.id).then(function(productResource) {
                                    scope.products.push(productResource);
                                });
                            });
                        }
                    });
                }
            }

            init();
        }
    ]);

})();