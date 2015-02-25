/*
 * product-controller.js
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

    var productController = angular.module('ImageManagementSample.controllers.product', []);

    productController.controller('ProductCtrl', ['$scope', 'ApiConnector', 'ResourceFactory',
        function(scope, ApiConnector, ResourceFactory) {

            scope.goAddImages = function() {
                if (scope.product.id !== null && scope.product.name !== null) {
                    scope.addProductsStep = 'addImages';
                }
            };

            scope.goAddDetail = function() {
                scope.addProductsStep = 'addDetail';
            };

            scope.goCatalogView = function() {
                scope.resetAddProductFields();
                reloadProducts();
                scope.productsView = 'catalog';
            };

            scope.goAddProduct = function() {
                scope.productsView = 'add';
                scope.addProductsStep = 'addDetail';
                scope.filteredImages = null;
                scope.resetAddProductFields();
            };

            scope.resetSelectedProduct = function() {
                scope.selectedProduct = null;
                scope.selectedProductImages = null;
            };

            scope.resetAddProductFields = function() {
                scope.product = {
                    name: null,
                    id: null,
                };
            };


            scope.selectProduct = function(product) {
                scope.productsView = 'product';
                ApiConnector.getProduct(product.id).then(function(product) {
                    scope.selectedProduct = product;
                    if (product !== null) {
                        ApiConnector.getProductImageIds(product.id).then(function(product) {
                            scope.selectedProductImages = [];
                            $.each(product.imageIds, function(index, imageId) {
                                ApiConnector.getImage(imageId).then(function(imageResource) {
                                    scope.selectedProductImages.push(imageResource);
                                });
                            });

                        });
                    }
                });
            };

            scope.getProducts = function() {
                return ApiConnector.getAllProducts().then(function(products) {
                    if (products) {
                        scope.currentProducts = products.items;
                    }
                });
            };

            scope.removeProduct = function(product) {
                return ApiConnector.removeProduct(product.id)
                    .then(function() {
                        reloadProducts();
                    });
            };

            scope.addImagesToProduct = function(product, urls) {
                if (urls) {
                    var imageResources = [];
                    var imageCollectionResource = null;
                    var imageUrls = urls.split(/\r\n|\r|\n/g);

                    $.each(imageUrls, function(index, url) {
                        var imageResource = ResourceFactory.createImageResource(url);
                        imageResources.push(imageResource);
                    });

                    return ApiConnector.addImage(ResourceFactory.createImageCollectionResource(imageResources)).then(function(images) {
                        var imageIds = [];
                        $.each(images.items, function(index, image) {
                            imageIds.push(image.id);
                        });

                        var productResource = ResourceFactory.createProductResource(product.id, product.name, imageIds);
                        ApiConnector.addImageIdsToProduct(product.id, productResource).then(function() {
                            scope.resetAddProductFields();
                            scope.goCatalogView();
                        });
                    }, function(errorData) {
                        alert(errorData.detail);
                    });
                }
            };

            scope.addExistingImagesToProduct = function(product, images) {
                if (images) {
                    var imageIds = [];
                    $.each(images, function(index, image) {
                        if (image.selected === true) {
                            imageIds.push(image.id);
                        }
                    });
                    var productResource = ResourceFactory.createProductResource(product.id, product.name, imageIds);

                    return ApiConnector.addImageIdsToProduct(product.id, productResource).then(function() {
                        scope.resetAddProductFields();
                        scope.goCatalogView();
                    }, function(errorData) {
                        alert(errorData.detail);
                    });
                }
            };

            scope.createProduct = function(product) {
                var tags = [];
                var productImages = [];

                var productResource = null;
                var productCollectionResource = null;

                if (product.id !== null && product.name !== null) {
                    if (product.tags) {
                        tags = trimStringArray(product.tags.split(","));
                    }

                    productResource = ResourceFactory.createProductResource(product.id, product.name, productImages, tags);
                    productCollectionResource = ResourceFactory.createProductCollectionResource([productResource]);

                    ApiConnector.createProduct(productCollectionResource).then(function() {
                        reloadProducts();
                    });
                }
            };

            scope.removeTagFromProduct = function(tag) {
                ApiConnector.removeTagFromProduct(scope.selectedProduct.id, tag).then(function(results) {
                    if (results !== null) {
                        ApiConnector.getProduct(scope.selectedProduct.id).then(function(product) {
                            if (product !== null) {
                                // reload the product with new list of tags
                                scope.selectedProduct = product;
                            }
                        });
                    }
                });

            };

            scope.removeImageFromProduct = function(imageId) {
                ApiConnector.removeImageFromProduct(imageId, scope.selectedProduct.id).then(function(results) {
                    if (results !== null) {
                        ApiConnector.getProductImageIds(scope.selectedProduct.id).then(function(product) {
                            scope.selectedProductImages = [];
                            $.each(product.imageIds, function(index, imageId) {
                                ApiConnector.getImage(imageId).then(function(imageResource) {
                                    scope.selectedProductImages.push(imageResource);
                                });
                            });

                        });
                    }
                });
            };

            scope.removeAllProductImages = function() {
                ApiConnector.removeAllImagesFromProduct(scope.selectedProduct.id).then(function(results) {
                    if (results !== null) {
                        ApiConnector.getProductImageIds(scope.selectedProduct.id).then(function(product) {
                            scope.selectedProductImages = [];
                            $.each(product.imageIds, function(index, imageId) {
                                ApiConnector.getImage(imageId).then(function(imageResource) {
                                    scope.selectedProductImages.push(imageResource);
                                });
                            });

                        });
                    }
                });
            };

            scope.addTagsToProduct = function(addTags) {
                var tags = addTags.split(",");
                var product = {
                    tags: tags,
                    name: scope.selectedProduct.name,
                    id: scope.selectedProduct.id
                };

                ApiConnector.addTagToProduct(scope.selectedProduct.id, product)
                    .then(function(results) {
                        if (results !== null) {
                            ApiConnector.getProduct(scope.selectedProduct.id).then(function(product) {
                                if (product !== null) {
                                    scope.selectedProduct = product;
                                }
                            });
                        }
                    });
            };

            scope.getProductsByTags = function(searchTags) {
                if (searchTags !== "" && searchTags !== null) {
                    var tags = toArrayFromCommaString(searchTags);
                    ApiConnector.getProductByTags(tags).then(function(products) {
                        if (products && products.totalItems > 0) {
                            scope.currentProducts = products.items;
                        } else {
                            scope.currentProducts = [];
                        }
                    });

                } else {
                    reloadProducts();
                }
            };

            scope.getImages = function(findBy, searchTag) {
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

            function init() {
                scope.limit = 12;
                scope.jsonURL = null;
                scope.addExistingImages = false;
                scope.selectedProduct = null;
                scope.productsView = 'catalog';
                scope.addProductsStep = 'addDetail';
                scope.resetAddProductFields();
                scope.filteredImages = null;
                scope.findBy = 'all';
                reloadProducts();
            }

            function reloadProducts() {
                scope.getProducts().then(function(products) {
                    if (products) {
                        if (products.totalItems > 0) {
                            scope.currentProducts = products.items;
                        } else {
                            scope.currentProducts = [];
                        }
                    }
                });
            }

            function trimStringArray(array) {
                for (var i = 0, j = array.length; i < j; i++) {
                    array[i] = array[i].trim();
                }
                return array;
            }

            init();
        }
    ]);
})();