# Image Manager APIs - Digital Asset Manager (Sample UI)

This package is provided as an easy way to get started using Akamai's Image Manager APIs.  API Reference can be found at https://developer.akamai.com/api/imaging/imaging/reference.html

This Sample Application illustrates how all of the Image Manager APIs can be used.

In order to use the Sample Application, you will need a set of Image Management {OPEN} credentials, and the API token generated when enabling Image Management in Property Manager.


## {OPEN} Node.js Server Installation

### Linux

Note that if you are using Ubuntu 12.04 the npm package may be broken. 

#### Install From Source
```sh
sudo apt-get install g++ curl libssl-dev apache2-utils
wget http://nodejs.org/dist/v0.10.36/node-v0.10.36.tar.gz
tar –xvf node-v0.10.35.tar.gz
mv node-v0.10.35
./configure
make
sudo make install
```

#### Using Package Manager
```sh
sudo apt-get install git nodejs npm
npm install -g bower
```

#### Download Repository and Install Node Packages
```sh
git clone https://github.com/akamai-open/imaging-sample-ui.git
cd ./imaging-sample-ui/OPENwrapper
npm install
cd webapp
bower install
```

### Mac
+ Install latest version of Xcode through the Mac Store

+ Install Command Line Tools
	##### Xcode: Preferences->Downloads install Command Line Tools

+ [Install Node.js](https://www.nodejs.org/download)

```sh
npm install -g bower
```


```sh
git clone https://github.com/ImageManagement/ImSamples.git imSampleWebUI
cd ./imSampleWebUI/OPENwrapper
npm install
cd webapp
bower install
```

### Windows
+ [Install Node.js](https://www.nodejs.org/download)
+ [Download Sample Client Package](https://github.com/ImageManagement/ImSampleClient/archive/master.zip)
+ Unzip the folder
+ Open a command line: **cmd.exe**


```cmd
npm install -g bower
dir \path\to\ImSampleWebUI
npm install
dir webapp
bower install
```

## Running the application server

### Unix-based systems
```sh
cd <path>/OPENwrapper
./run.sh
```
You may need to ```chmod 775 run.sh``` before you can run the program. 

### Windows Systems
Open cmd.exe
```cmd
dir <path>
node OPENwrapper/index.js
```

## Runtime Options
The following options are supported when launching the application

#### Port
```
./run.sh -p 6000
OR
node OPENwrapper/index.js -p 6000
```

#### Config
```sh
./run.sh -c /path/to/config.json
node OPENwrapper/index.js -c /path/to/config.json
```

This will run the server with the specified configuration file which **MUST** be valid JSON. If you haven't changed the configuration, it should be running at [http://localhost:8421](http://localhost:8421)

## Sample DAM UI Deployment

### Install Bower Package Manager

Bower is a package manager used to retrieve web project dependencies. 

#### Unix-based Systems
To install, run

```npm install -g bower
```

Then run the following command to install the project dependencies. 

``` bower install
```

Ensure all libraries are in ```OPENwrapper/webapp/bower_components```
 or update ```OPENwrapper/webapp/index.html``` if you placed them elsewhere
#### Windows Systems

Download the following libraries

+ [Angular 1.3.8 and Angular Route Module 1.3.8](https://docs.angularjs.org/misc/downloading)
+ [jQuery 2.1.3](http://jquery.com/download/)
+ [Bootstrap 3.3.2](http://getbootstrap.com/getting-started/)


Place the libraries in ```OPENwrapper/webapp``` and update the paths in the ```OPENwrapper/webapp/index.html```   


### Configuration

By default the Sample DAM application will expect the OPEN Node.js server to be listening at the same origin, if you like to change this

+ Navigate to ```/path/to/sampleapp/webapp/js/configuration.js```
+ Change the apiHost to your new url, with the format of *protocol://domain:port/*

```
var apiHost = "http://sampledomain:6000/";
```

### Launch
Launch a web browser and navigate to the web server URL



## License

> Copyright 2015 Akamai Technologies, Inc. All Rights Reserved.
> 
> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
>
> A copy of the License is distributed with this software, or you
> may obtain a copy of the License at 
>
>    http://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.
