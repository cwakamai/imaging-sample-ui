/*
 * directive.js
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



var app = angular.module('ImageManagementSample.directives', []);

app.directive("selectablePagedImageList", ["ApiConnector", "$q", function(ApiConnector, q) {
    return {
        restrict: 'E',
        scope: {
            images: "=",
            selectedImages: "=",
            limit: "&",
            search: "&"
        },
        link: function(scope, element) {

            var pageByLimit = scope.limit();

            var resetList = function(images) {
                scope.visibleImages = [];
                scope.pageNumbers = [];
                scope.currentPage = 1;
                if (!isNaN(pageByLimit) && images) {
                    var numOfPages = images.length / pageByLimit;

                    for (var i = 0; i < numOfPages; i++) {
                        scope.pageNumbers.push(i + 1);
                    }
                    loadImages(images.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            var loadImages = function(images) {
                if (images) {
                    scope.visibleImages = images;
                }
            };

            resetList(scope.images);

            scope.findBy = 'all';

            scope.toggleSelectImage = function(image) {
                if (image.selected) {
                    scope.selectedImages.push(image);
                } else {
                    for (var i = 0; i < scope.selectedImages.length; i++) {
                        if (scope.selectedImages[i].id === image.id) {
                            scope.selectedImages.splice(i, 1);
                            break;
                        }
                    }
                }
            };

            scope.selectAllImage = function() {
                scope.selectedImages.splice(0, scope.selectedImages.length - 1);
                $.each(scope.images, function(index, image) {
                    scope.selectedImages.push(image);
                    image.selected = true;
                });
                scope.selectAll = false;
                scope.selectCurrentPage = false;
            };

            scope.deselectAllImage = function() {
                $.each(scope.selectedImages, function(index, selectedImage) {
                    selectedImage.selected = false;
                });

                scope.selectedImages.splice(0, scope.selectedImages.length - 1);
                scope.selectAll = true;
                scope.selectCurrentPage = true;
            };

            scope.toggleCurrentPage = function() {
                var selectedImagesHash = {};
                $.each(scope.selectedImages, function(index, selectedImage) {
                    selectedImagesHash[selectedImage.id] = selectedImage;
                });

                if (scope.selectCurrentPage) {
                    $.each(scope.visibleImages, function(index, visibleImage) {
                        selectedImagesHash[visibleImage.id] = visibleImage;
                        visibleImage.selected = true;
                    });
                } else {
                    $.each(scope.visibleImages, function(index, visibleImage) {
                        selectedImagesHash[visibleImage.id] = false;
                        visibleImage.selected = false;
                    });
                }

                scope.selectedImages.splice(0, scope.selectedImages.length - 1);
                $.each(selectedImagesHash, function(imageId, selectedImage) {
                    if (selectedImage) {
                        scope.selectedImages.push(selectedImage);
                    }
                });

                scope.selectCurrentPage = !scope.selectCurrentPage;
            };

            scope.searchImages = function(findBy, searchTag) {
                scope.selectAll = true;
                scope.selectCurrentPage = true;
                var newImages = [];

                if (!searchTag) {
                    searchTag = "";
                }

                // check the content has no errors or is defined
                if ('all' == findBy) {
                    ApiConnector.getAllImages().then(function(imageData) {
                        scope.images = imageData.items;
                    });
                } else if ('tag' === findBy) {
                    ApiConnector.getImagesByTags(searchTag)
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
                    ApiConnector.getImage(searchTag)
                        .then(function(imageResource) {
                            if (imageResource !== null) {
                                scope.images = [imageResource];
                            }
                        });
                } else if ('url' === findBy) {
                    ApiConnector.getImagesByUrl(searchTag)
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
                }
            };

            scope.$watchCollection('images', function(newVal, oldVal) {
                resetList(newVal);
            });

            scope.nextPage = function() {
                if (scope.currentPage < scope.pageNumbers.length) {
                    scope.currentPage = scope.currentPage + 1;
                    loadImages(scope.images.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.prevPage = function() {
                if (scope.currentPage > 1) {
                    scope.currentPage = scope.currentPage - 1;
                    loadImages(scope.images.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.goToImagePage = function(index) {
                if (0 < index < scope.pageNumbers.length) {
                    scope.currentPage = index;
                    loadImages(scope.images.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };
        },
        templateUrl: "partials/directive-templates/image-selector.html"
    };
}]);

app.directive("pagedJobList", ['ApiConnector', '$filter', function(ApiConnector, filter) {
    return {
        restrict: 'E',
        scope: {
            filter: "=",
            limit: "&",
            view: "&"
        },
        link: function(scope) {

            var allJobs = [];
            var filteredJobs = [];

            function resetFilter(filterTerm) {
                if (filterTerm !== 'all') {
                    filteredJobs = filter('jobstate')(allJobs, filterTerm);
                }else {
                    filteredJobs = allJobs;
                }

                if (!isNaN(scope.limit()) && filteredJobs) {
                    filter('recent')(filteredJobs);
                    scope.pageNumbers = generatePageNumbers(filteredJobs.length, scope.limit());
                    scope.visibleJobs = filteredJobs.slice((scope.currentPage - 1) * scope.limit(), (scope.currentPage * scope.limit()));
                }
            }

            function generatePageNumbers(numberOfItems, pageSize) {
                var numOfPages = numberOfItems / pageSize;
                var pageNums = [];

                for (var i = 0; i < numOfPages; i++) {
                    pageNums.push(i + 1);
                }

                return pageNums;
            }

            function init() {
                ApiConnector.getJobs().then(function(job) {
                    if (job !== null) {
                        allJobs = job.items
                        scope.visibleJobs = [];
                        scope.pageNumbers = [];
                        scope.currentPage = 1;
                        resetFilter(scope.filter);
                    } else {
                        //error retrieving jobs
                    }
                });


            };

            init();

            scope.$watch('filter', function(newFilterTerm) {
                if (allJobs) {
                    scope.currentPage = 1;
                    resetFilter(newFilterTerm);
                }
            });

            scope.refreshJobs = function() {
                init();
            }

            scope.goViewJob = function(job) {
                scope.view({
                    'job': job
                });
            };

            scope.nextPage = function() {
                if (scope.currentPage < scope.pageNumbers.length) {
                    scope.currentPage = scope.currentPage + 1;
                    scope.visibleJobs = filteredJobs.slice((scope.currentPage - 1) * scope.limit(), (scope.currentPage * scope.limit()));
                }
            };

            scope.prevPage = function() {
                if (scope.currentPage > 1) {
                    scope.currentPage = scope.currentPage - 1;
                    scope.visibleJobs = filteredJobs.slice((scope.currentPage - 1) * scope.limit(), (scope.currentPage * scope.limit()));
                }
            };

            scope.goToJobPage = function(index) {
                if (0 < index < scope.pageNumbers.length) {
                    scope.currentPage = index;
                    scope.visibleJobs = filteredJobs.slice((scope.currentPage - 1) * scope.limit(), (scope.currentPage * scope.limit()));
                }
            };

        },
        templateUrl: "partials/directive-templates/paged-job-list.html"
    };
}]);

app.directive("pagedPolicyList", ['ApiConnector', '$filter', function(ApiConnector, filter) {
    return {
        restrict: 'E',
        scope: {
            policies: "=",
            limit: "&",
            remove: "&",
            select: "&"
        },
        link: function(scope, element, attributes) {
            var pageByLimit = scope.limit();

            var resetList = function(policies) {
                scope.visiblePolicies = [];
                scope.pageNumbers = [];
                scope.currentPage = 1;
                
                if (!isNaN(pageByLimit) && policies) {
                    var numOfPages = policies.length / pageByLimit;

                    for (var i = 0; i < numOfPages; i++) {
                        scope.pageNumbers.push(i + 1);
                    }
                    loadPolicies(policies.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            var loadPolicies = function(policies) {
                if (policies) {
                    scope.visiblePolicies = policies;
                }
            };

            resetList(scope.policies);

            scope.$watchCollection('policies', function(newVal, oldVal) {
                resetList(newVal);
            });

            scope.nextPage = function() {
                if (scope.currentPage < scope.pageNumbers.length) {
                    scope.currentPage = scope.currentPage + 1;
                    loadPolicies(scope.policies.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.prevPage = function() {
                if (scope.currentPage > 1) {
                    scope.currentPage = scope.currentPage - 1;
                    loadPolicies(scope.policies.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.goToPolicyPage = function(index) {
                if (0 < index < scope.pageNumbers.length) {
                    scope.currentPage = index;
                    loadPolicies(scope.policies.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.removePolicy = function(policyId) {
                scope.remove({
                    'policyId': policyId
                });
            };

            scope.viewPolicy = function(policyId) {
                scope.select({
                    'policyId': policyId
                });
            };
        },
        templateUrl: "partials/directive-templates/paged-policy-list.html"
    };
}]);

app.directive("pagedRfwPolicyList", ['ApiConnector', '$filter', function(ApiConnector, filter) {
    return {
        restrict: 'E',
        scope: {
            rfwpolicies: "=",
            limit: "&",
            remove: "&",
            select: "&"
        },
        link: function(scope, element, attributes) {
            var pageByLimit = scope.limit();

            var resetList = function(rfwPolicies) {
                scope.visibleRFWPolicies = [];
                scope.pageNumbers = [];
                scope.currentPage = 1;
                
                if (!isNaN(pageByLimit) && rfwPolicies) {
                    var numOfPages = rfwPolicies.length / pageByLimit;

                    for (var i = 0; i < numOfPages; i++) {
                        scope.pageNumbers.push(i + 1);
                    }
                    loadRFWPolicies(rfwPolicies.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            var loadRFWPolicies = function(rfwPolicies) {
                if (rfwPolicies) {
                    scope.visibleRFWPolicies = rfwPolicies;
                }
            };

            resetList(scope.rfwpolicies);

            scope.$watchCollection('rfwpolicies', function(newVal, oldVal) {
                resetList(newVal);
            });

            scope.nextPage = function() {
                if (scope.currentPage < scope.pageNumbers.length) {
                    scope.currentPage = scope.currentPage + 1;
                    loadRFWPolicies(scope.rfwpolicies.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.prevPage = function() {
                if (scope.currentPage > 1) {
                    scope.currentPage = scope.currentPage - 1;
                    loadRFWPolicies(scope.rfwpolicies.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.goToRFWPolicyPage = function(index) {
                if (0 < index < scope.pageNumbers.length) {
                    scope.currentPage = index;
                    loadRFWPolicies(scope.rfwpolicies.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.removeRFWPolicy = function(rfwPolicyID) {
                scope.remove({
                    'rfwPolicyID': rfwPolicyID
                });
            };

            scope.viewRFWPolicy = function(rfwPolicyID) {
                scope.select({
                    'rfwPolicyID': rfwPolicyID
                });
            };
        },
        templateUrl: "partials/directive-templates/paged-rfwpolicy-list.html"
    };
}]);

app.directive("pagedImageCollectionList", ['ApiConnector', function(ApiConnector) {
    return {
        restrict: 'E',
        scope: {
            imagecollections: "=",
            remove: "&",
            select: "&"
        },
        link: function(scope, element, attributes) {
            var pageByLimit = 20;

            var resetList = function(imagecollections) {
                scope.visibleImageCollections = [];
                scope.pageNumbers = [];
                scope.currentPage = 1;

                if (imagecollections) {
                    var numOfPages = imagecollections.length / pageByLimit;

                    for (var i = 0; i < numOfPages; i++) {
                        scope.pageNumbers.push(i + 1);
                    }
                    loadImageCollections(imagecollections);
                } else {
                }
            };

            var loadImageCollections = function(imagecollections) {
                if (imagecollections) {
                    scope.visibleImageCollections = imagecollections;
                }
            };

            resetList(scope.imagecollections);

            scope.$watchCollection('imagecollections', function(newVal, oldVal) {
                resetList(newVal);
            });

            scope.nextPage = function() {
                if (scope.currentPage < scope.pageNumbers.length) {
                    scope.currentPage = scope.currentPage + 1;
                    loadImageCollections(scope.imagecollections.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.prevPage = function() {
                if (scope.currentPage > 1) {
                    scope.currentPage = scope.currentPage - 1;
                    loadImageCollections(scope.imagecollections.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.goToImageCollectionPage = function(index) {
                if (0 < index < scope.pageNumbers.length) {
                    scope.currentPage = index;
                    loadImageCollections(scope.imagecollections.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.removeImageCollection = function(imageCollectionID) {
                scope.remove({
                    'imageCollectionID': imageCollectionID
                });
            };

            scope.viewImageCollection = function(imageCollectionID) {
                scope.select({
                    'imageCollectionID': imageCollectionID
                });
            };
        },
        templateUrl: "partials/directive-templates/paged-image-collection-list.html"
    };
}]);

app.directive("pagedImageList", ['ApiConnector', '$filter', function(ApiConnector, filter) {
    return {
        restrict: 'E',
        scope: {
            images: "=",
            showProduct: "=",
            limit: "&",
            remove: "&",
            toggle: "&toggle"
        },
        link: function(scope, element) {
            var pageByLimit = scope.limit();
            var resetList = function(images) {
                scope.visibleImages = [];
                scope.pageNumbers = [];
                scope.currentPage = 1;
                if (!isNaN(pageByLimit) && images) {
                    var numOfPages = images.length / pageByLimit;

                    for (var i = 0; i < numOfPages; i++) {
                        scope.pageNumbers.push(i + 1);
                    }
                    loadImages(images.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit)));
                }
            };

            var loadImages = function(images) {
                if (images) {
                    scope.visibleImages = images;
                }
            };

            resetList(scope.images);

            scope.$watchCollection('images', function(newVal, oldVal) {
                resetList(newVal);
            });

            scope.isProductEnabled = scope.showProduct;

            scope.nextPage = function() {
                if (scope.currentPage < scope.pageNumbers.length) {
                    scope.currentPage = scope.currentPage + 1;
                    loadImages(scope.images.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.prevPage = function() {
                if (scope.currentPage > 1) {
                    scope.currentPage = scope.currentPage - 1;
                    loadImages(scope.images.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.goToImagePage = function(index) {
                if (0 < index < scope.pageNumbers.length) {
                    scope.currentPage = index;
                    loadImages(scope.images.slice((scope.currentPage - 1) * pageByLimit, (scope.currentPage * pageByLimit) - 1));
                }
            };

            scope.removeImage = function(imageId, index) {
                ApiConnector.removeImage(imageId).then(function(results) {
                    if (results) {
                        scope.images.splice((scope.currentPage - 1) * pageByLimit + index, 1);
                    } else {
                        alert("ERROR: Unable to delete image.");
                    }
                });
            };
        },
        templateUrl: "partials/directive-templates/paged-image-list.html"
    };
}]);

app.directive('transformStep', function() {
    return {
        restrict: 'E',
        scope: {
            transform: "="
        },
        link: function(scope, element) {
            scope.isTransform = function(transformValue) {
                if (Object.prototype.toString.call(transformValue) === '[object Array]') {
                    return true;
                }
                return false;
            };

            scope.transformFormat = function(subTransform) {
                var format = "";
                for (var attribute in subTransform) {
                    if (attribute == "image") {
                        format += "image URL: " + subTransform[attribute].url + "\n";
                    } else if (attribute == "transformations") {
                        format += "transformations: ..." + "\n";
                    } else if (attribute != "$$hashKey") {
                        format += attribute + ": " + subTransform[attribute] + "\n";
                    }
                }

                format = format.slice(0, format.length - 1);
                return format;
            };

        },
        template: "<div class=\"side-padding\" ng-repeat=\"(transformAttr, transformValue) in transform\">" +
            "<div style=\"line-height: 2\" ng-if=\"transformAttr != 'image'\">" +
            "<strong>{{transformAttr}}:</strong>" +
            "<div class=\"side-padding\" ng-if=\"isTransform(transformValue)\">" +
            "<div ng-if=\"!(transformValue.length)\">" +
            "<h5>None Specified</h5>" +
            "</div>" +
            "<div ng-if=\"!!(transformValue.length)\" ng-repeat=\"subTransform in transformValue\" class=\"no-vertical-padding side-padding\">" +
            "<p style=\"margin-bottom: 0px\">Step {{$index +1}}</p>" +
            "<p class=\"side-padding\" style=\"white-space: pre-line; line-height: 2; margin-bottom: 0px\">" +
            "{{transformFormat(subTransform)}}" +
            "</p>" +
            "</div>" +
            "</div>" +
            "<span ng-if=\"!isTransform(transformValue)\"> {{transformValue == null ? 'Unspecified' : transformValue}}</span>" +
            "</div>" +
            "<div ng-if=\"transformAttr == 'image'\">" +
            "<p style=\"margin-bottom: 0px; line-height: 2\"><strong>Image Url: </strong>{{transformValue.url == null ? 'Unspecified' : transformValue.url}}</p>" +
            "</div>" +
            "</div>"
    };
});

app.directive('searchGroup', function() {
    return {
        restrict: 'E',
        scope: {
            findBy: "=term",
            filterContent: "=filter"
        },
        link: function(scope, element) {
            scope.changeSearchTerm = function(term) {
                scope.findBy = term;
                if (term === 'all') {
                    scope.filterContent = '';
                }
            };
        },
        template: "<div class=\"btn-group\" ng-init=\"findBy=\'all\'\">" +
            "<button id=\"findAll\" type=\"button\" class=\"btn btn-default\" ng-click=\"changeSearchTerm('all')\" ng-class=\"{active: findBy == 'all'}\">All</button>" +
            "<button id=\"findByTag\" type=\"button\" class=\"btn btn-default\" ng-click=\"changeSearchTerm('tag')\" ng-class=\"{active: findBy == 'tag'}\">Tag</button>" +
            "<button id=\"findById\" type=\"button\" class=\"btn btn-default\" ng-click=\"changeSearchTerm('id')\" ng-class=\"{active: findBy == 'id'}\">ID</button>" +
            "<button id=\"findurl\"type=\"button\" class=\"btn btn-default\" ng-click=\"changeSearchTerm('url')\" ng-class=\"{active: findBy == 'url'}\">URL</button>" +
            "</div>"
    };
});

app.directive('bulkStatus', function() {
    return {
        restrict: 'E',
        scope: {
            show: "=",
            passed: "=", // green
            pending: "=", //light blue
            failed: "=" // red
        },
        link: function(scope, element) {

            scope.$watch('passed', function(newValue) {
                var percentWidth = (parseInt(newValue) / parseInt(scope.passed + scope.pending + scope.failed)) * 100;
                scope.passedStyle = {
                    width: percentWidth + "%"
                };
            });

            scope.$watch('pending', function(newValue) {
                var percentWidth = (parseInt(newValue) / parseInt(scope.passed + scope.pending + scope.failed)) * 100;
                scope.pendingStyle = {
                    width: percentWidth + "%"
                };
            });

            scope.$watch('failed', function(newValue) {
                var percentWidth = (parseInt(newValue) / parseInt(scope.passed + scope.pending + scope.failed)) * 100;
                scope.failedStyle = {
                    width: percentWidth + "%"
                };
            });
        },
        template: '<div ng-if="show" class="progress">' +
            '<div class="progress-bar progress-bar-success" ng-style="passedStyle">' +
            '<span class="sr-only">{{passedStyle}}</span>' +
            '</div>' +
            '<div class="progress-bar progress-bar-info" ng-style="pendingStyle">' +
            '<span class="sr-only">{{pendingStyle}}</span>' +
            '</div>' +
            '<div class="progress-bar progress-bar-danger"ng-style="failedStyle">' +
            '<span class="sr-only">{{failedStyle}}</span>' +
            '</div>' +
            '</div>'

    };
});

app.directive('download', function($compile) {
    return {
        restrict: 'E',
        scope: {
            policy: '=policy'
        },
        link: function(scope, elm, attrs) {
            var fileBlob = new Blob([angular.toJson(scope.policy)], {
                type: "application/json"
            });
            scope.policyJsonData = URL.createObjectURL(fileBlob);
            scope.policyJsonDataName = scope.policy.id + "-policy";

            elm.replaceWith($compile(
                '<a id=\"download_' + scope.policy.id + '\" download="' + scope.policyJsonDataName + '" href="' + scope.policyJsonData + '">' +
                'Download' +
                '</a>'
            )(scope));
        }
    };
});

app.directive('downloadic', function($compile) {
    return {
        restrict: 'E',
        scope: {
            imagecollection: '=imagecollection'
        },
        link: function(scope, element, attrs) {
            var fileBlob = new Blob([angular.toJson(scope.imagecollection)], {
                type: "application/json"
            });
            scope.imageCollectionJsonData = URL.createObjectURL(fileBlob);
            scope.imageCollectionJsonDataName = scope.imagecollection.id + "-imagecollection";

            element.replaceWith($compile(
                '<a id=\"download_' + scope.imagecollection.id + '\" download="' + scope.imageCollectionJsonDataName + '" href="' + scope.imageCollectionJsonData + '">' +
                'Download' +
                '</a>'
            )(scope));
        }
    };
});

app.directive("upload", [function() {
    return {
        restrict: 'A',
        scope: {
            upload: "="
        },
        link: function(scope, element, attributes) {
            element.bind("change", function(changeEvent) {
                var fileReader = new FileReader();
                fileReader.onload = function(loadEvent) {
                    scope.$apply(function() {
                        scope.upload = loadEvent.target.result;
                    });
                };
                fileReader.readAsText(changeEvent.target.files[0]);
            });
        }
    };
}]);