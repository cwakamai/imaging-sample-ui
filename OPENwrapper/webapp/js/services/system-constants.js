/*
 * system-constants.js
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

    var app = angular.module('ImageManagementSample.services.system', []).
    value('version', '1.0');

    app.factory('SystemConstants', function() {
        /*
        name: name of the transform
        argType: options, input, both, none
        input: array of the names of the input the use is required to 
        */

        var isProductEnabled = false;

        //var icTypes = ["AkaImage", "Color", "Gallery", "Image", "Rotatable"];

        var icTypes = ["Gallery"];

        var constructs = {
            "gravity": ["North", "NorthEast", "East", "SouthEast", "South", "SouthWest", "West", "NorthWest", "Center"],
            "image": {
                "url": null,
                "transformation": null
            },
            "interpolation": ["Point", "Hermite", "Cubic", "Box", "Gaussian", "Catrom", "Triangle", "Quadratic", "Mitchell", "Lanczos", "Hamming", "Parzen", "Blackman", "Kaiser", "Welsh", "Hanning", "Bartlett", "Bohman"],
            "subsamplequality": ["full", "half", "quarter"],
            "browser": ["Safari", "Chrome", "IE", "Generic"],
            "resizetype": ["normal", "upsize", "downsize"],
            "scaledimension": ["width", "height"],
            "aspectTypes": ["ignore","fit","fill"]
        };

        var transformations = [{ 
            "name": "BackgroundColor",
            "inputs": [{
                    "name":     "color",
                    "info":     "A 6 character Hex String, Eg. 00BB4F",
                    "type":     "color",
                    "required": true,
                    "default":  "FFFFFF"
                }
            ]
        }, {
            "name": "Composite",
            "inputs": [{
                    "name": "image",
                    "type": "image",
                    "required": true
                }, // Required. Image to compose.
                {
                    "name": "xPosition",
                    "type": "int",
                    "required": false,
                    "max": 5000,
                    "min": -5000,
                    "default": 0
                }, // Optional. Default = 0. Integer x position.
                {
                    "name": "yPosition",
                    "type": "int",
                    "required": false,
                    "max": 5000,
                    "min": -5000,
                    "default": 0
                }, // Optional. Default = 0. Integer y position.
                {
                    "name":     "gravity",
                    "info":     "Where to position the second image relative to the center of the first",
                    "type":     "options",
                    "options":  "gravity",
                    "required": false,
                    "default": "NorthWest"
                }, // Optional. Default = "NorthWest". Gravity string.
                {
                    "name": "enableScaling",
                    "type": "booleanComposite",
                    "required": false,
                    "default": false
                }, // Optional. Default is false.
                {
                    "name": "scale",
                    "type": "float",
                    "required": false,
                    "default": 0.5,
                    "max": 10,
                    "min": 0,
                    "minInclusive": false
                }, {
                    "name": "scaleDimension",
                    "type": "options",
                    "options": "scaledimension",
                    "required": false,
                    "default": "width"
                }
            ]
        }, {
            "name": "Crop",
            "inputs": [{
                    "name": "width",
                    "type": "int",
                    "required": true,
                    "default": 0,
                    "max": 5000,
                    "min": 0
                },
                {
                    "name": "height",
                    "type": "int",
                    "required": true,
                    "default": 0,
                    "max": 5000,
                    "min": 0                
                },
                {
                    "name": "xPosition",
                    "type": "int",
                    "required": true,
                    "default": 0,
                    "max": 5000,
                    "min": 0
                },
                {
                    "name": "yPosition",
                    "type": "int",
                    "required": true,
                    "default": 0,
                    "max": 5000,
                    "min": 0
                },
                {
                    "name":     "gravity",
                    "info":     "Where to position the transformation relative to the center",
                    "type":     "options",
                    "options":  "gravity",
                    "required": false,
                    "default":  "NorthWest"
                },
                {
                    "name":     "allowExpansion",
                    "info":     "Allows crop to expand the canvas of an image if the crop area falls outside the existing canvas",
                    "type":     "booleanComposite",
                    "required": false,
                    "default":  false
                }
            ]
        }, {
            "name": "HSL",
            "inputs": [{
                    "name":     "hue",
                    "info":     "The number of degrees to rotate on the color wheel",
                    "type":     "float",
                    "required": false,
                    "default":  0.0,
                    "max":      360,
                    "min":      0
                },{
                    "name":     "saturation",
                    "info":     "Multiplier to adjust colour saturation",
                    "type":     "float",
                    "required": false,
                    "default":  1.0,
                    "max":      9000,
                    "min":      0
                },{
                    "name":     "lightness",
                    "info":     "Multiplier to adjust image lightness",
                    "type":     "float",
                    "required": false,
                    "default":  1.0,
                    "max":      9000,
                    "min":      0
                }
            ]
        }, {
            "name": "MaxColors",
            "inputs": [{
                    "name": "colors",
                    "type": "int",
                    "required": true,
                    "max": 256,
                    "min": 1,
                    "default": 256
                } // Required. Integer of colors the input image should be reduced to.
            ]
        }, {
            "name": "Opacity",
            "inputs": [{
                    "name": "opacity",
                    "info": "How transparant you want the image to be as a fraction from 0.0 (transparant) to 1.0 (original image opacity)",
                    "type": "float",
                    "required": true,
                    "max": 10.0,
                    "min": 0.0,
                    "minInclusive": true,
                    "default": 1.0
                } // Required. Float used to multiply pixel alpha values.
            ]
        }, {
            "name": "Resize",
            "inputs": [{
                    "name": "width",
                    "type": "intResize",
                    "required": true,
                    "max": 5000,
                    "min": 1,
                    "default": 100
                }, // It is required that one or both of "width"
                {
                    "name": "height",
                    "type": "intResize",
                    "required": true,
                    "max": 5000,
                    "min": 1,
                    "default": 100
                }, // and "height" be present.
                {
                    "name": "aspect",
                    "type": "options",
                    "required": false,
                    "options":"aspectTypes",
                    "default": "fit"
                },
                {
                    "name": "type",
                    "type": "options",
                    "options": "resizetype",
                    "required": false,
                    "default": "normal"
                } // Optional. Default is "normal".
            ]
        }, {
            "name": "Scale",
            "inputs": [{
                    "name": "width",
                    "type": "float",
                    "required": true,
                    "default": 0.5,
                    "max": 10,
                    "min": 0,
                    "minInclusive": false
                }, // Required. Float multiple of input width.
                {
                    "name": "height",
                    "type": "float",
                    "required": true,
                    "default": 0.5,
                    "max": 10,
                    "min": 0,
                    "minInclusive": false
                } // Required. Float multiple of input height.
            ]
        }, {
            "name": "Grayscale"
        }
    ];


        return {
            getIsProductEnabled: function() {
                return isProductEnabled;
            },
            getSystemTransforms: function() {
                return transformations;
            },
            getSystemTransformsByName: function(transformName) {
                return transformations[transformName];
            },
            getIcTypes: function() {
                return icTypes;
            },
            getConstructs: function() {
                return constructs;
            },
            getConstructsByName: function(constructName) {
                return constructName;
            }
        };
    });
})();