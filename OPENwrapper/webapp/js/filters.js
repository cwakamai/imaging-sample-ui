/*
 * filters.js
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
    angular.module('ImageManagementSample.filters', []).
    filter('capitalize', function() {
        return function(msg) {
            var words = msg.split(" ");
            $.each(words, function(index, word) {
                words[index] = word.charAt(0).toUpperCase() + word.slice(1);
            });

            return words.join(" ");
        };
    }).
    filter('recent', function() {
        return function(jobs) {
            jobs.sort(function(first, second) {
                var firstDate = new Date(first.createdDate);
                var secondDate = new Date(second.createdDate);
                return secondDate.getTime() - firstDate.getTime();
            });
            return jobs;
        };
    }).filter('jobstate', function() {
        return function(jobs, jobState) {
            var filteredJobs = [];
            $.each(jobs, function(index, job) {
                if (job.state.toLowerCase() === jobState.toLowerCase()) {
                    filteredJobs.push(job);
                }
            });
            return filteredJobs;
        };
    }).filter('bypass', function() {
        return function(url) {
            return url;
        };
    });

})();
