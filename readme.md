# Image Manager APIs - Digital Asset Manager (Sample UI)

This package is provided as an easy way to get started using Akamai's Image Manager APIs.  API Reference can be found at https://developer.akamai.com/api/imaging/imaging/reference.html

This Application illustrates how all of the Image Manager APIs can be used.

In order to use the DAM, you will need a set of Image Manager {OPEN} credentials, and the API token generated when enabling Image Manager in Property Manager.


## {OPEN} Node.js Server Installation

### Linux

#### Using Package Manager
```sh
# Installing Node.js
sudo apt-get install git nodejs npm
# Installing Bower
sudo npm install -g bower
```

Note that the package package may be broken as it was for some versions of ubuntu 12.04. You might be better off installing from source.

#### Install From Source
```sh
# Installing prerequisite packages
sudo apt-get install g++ curl libssl-dev apache2-utils
# Getting Node.js Source
wget http://nodejs.org/dist/v0.12.7/node-v0.12.7.tar.gz
tar –xvf node-v0.12.7.tar.gz
cd node-v0.12.7
./configure
make
sudo make install
```

#### Download Repository and Install Packages
```sh
git clone https://github.com/akamai-open/imaging-sample-ui.git imaging-sample-ui
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
sudo npm install -g bower
```


```sh
git clone https://github.com/akamai-open/imaging-sample-ui.git imaging-sample-ui
cd ./imaging-sample-ui/OPENwrapper
npm install
cd webapp
bower install
```

### Windows
+ [Install Node.js](https://www.nodejs.org/download)
+ [Download Client Package](https://github.com/akamai-open/imaging-sample-ui/archive/master.zip)
+ Unzip the folder
+ Open a command line: **cmd.exe**


```cmd
npm install -g bower
cd \path\to\ImSampleWebUI
npm install
cd webapp
bower install
```

## Running the DAM (Node Server + Webapp)

### Configuration

The DAM application will need you to update a configuration file to add your OPEN credentials. 

+ Edit path/to/imaging-sample-ui/OPENwrapper/src/conf.json
+ Change the credentials to the ones you recieved from Luna
``` js
{
	"openConf":
	{
		"client_token":"xxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx",
		"client_secret":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=",
		"access_token":"xxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx",
		"base_uri":"https://xxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx.imaging.akamaiapis.net"
	},
	"purgeConf":
	{
		"host":"https://xxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx.purge.akamaiapis.net",
		"client_token":"xxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx",
		"access_token":"xxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx",
		"secret":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=",
		"max-body":4096
	}
}
```

### Unix (Linux/Mac) based systems
```sh
cd <path_to>/imaging-sample-ui
./run.sh
```
You may need to ```chmod 775 run.sh``` before you can run the program.

### Windows Systems
Open cmd.exe
```cmd
cd <path>
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

## DAM UI Deployment

### Install Bower Package Manager

Bower is a package manager used to retrieve web project dependencies.

#### Unix-based Systems
To install, run

```
npm install -g bower
```

Then run the following command to install the project dependencies.

```
bower install
```

Ensure all libraries are in ```OPENwrapper/webapp/bower_components```
 or update ```OPENwrapper/webapp/index.html``` if you placed them elsewhere

#### Windows Systems

Download the following libraries

+ [Angular 1.3.8 and Angular Route Module 1.3.8](https://docs.angularjs.org/misc/downloading)
+ [jQuery 2.1.3](http://jquery.com/download/)
+ [Bootstrap 3.3.2](http://getbootstrap.com/getting-started/)


Place the libraries in ```OPENwrapper/webapp``` and update the paths in the ```OPENwrapper/webapp/index.html```

## Accessing the DAM once it is launched

Launch a web browser and navigate to the web server URL. The default URL on the system it is running on should be http://localhost:8421

If you are accessing the DAM from another machine you should connect to http://[host_server_ip]:8421


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
