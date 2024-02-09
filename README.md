# Argus - Frontend
![build](https://github.com/Uninett/Argus-frontend/workflows/Node.js%20CI/badge.svg)
[![codecov](https://codecov.io/gh/Uninett/Argus-frontend/branch/master/graph/badge.svg)](https://codecov.io/gh/Uninett/Argus-frontend)


The Argus-frontend provides a graphical web interface to use with Argus. It has been built using React with TypeScript.
The backend can be found at https://github.com/Uninett/Argus.

Here's how to get started with development.


## Requirements

- Argus backend
- Node.js with npm

Set up the Argus backend according to the instructions in its repository (https://github.com/Uninett/Argus).

Furthermore, [Node.js](http://nodejs.org/) is required. We also use the [Node Package Manager (npm)](https://www.npmjs.com/), which comes bundled with Node.js.

**Optionally**, you can forego a full installation of Node.js and npm on your local system, and instead opt to run a complete Argus setup using [Docker Compose](https://docs.docker.com/compose/). If so, skip directly to the *Install and startup* section.

Installation procedures are as follows:

### Install Node.js

#### OS X

Use the Terminal app (located at `/Applications/Utilities/Terminal.app`).

Install [Homebrew](http://brew.sh/) with the following command.

    ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

Then run

    brew install node

to start the installation.

#### Ubuntu Linux

Open a terminal and run the following commands:

    sudo apt-get install python-software-properties
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs

#### Windows

Download the Node.js installer from http://nodejs.org/ and follow the installation instructions provided on the website.
Make sure that the `git` command is available in your PATH.

---

After installation, test your Node.js with the following commands:

    $ node --version
    v10.11.0

    $ npm --version
    6.4.1

You successfully installed Node.js! Now let's continue to Argus frontend.

## Install and startup Argus frontend

To download Argus frontend and install all required dependencies, run

    git clone https://github.com/Uninett/Argus-frontend
    cd Argus-frontend
    npm install

Afterwards, use

    npm start

to start the app in development mode.
This will open your browser at http://localhost:3000 or similar.

Congrats, you now have the Argus frontend up and running!

Note that the website will automatically reload as you edit the code.

### Configuration

Default configuration options for the Argus frontend are located in `src/config.tsx`. All of these options can be set using **environment** variables when running the frontend under the Node server (or in Docker Compose), or by providing **configuration** variables in `runtime-config.json` file.

**Configuration** variables can be provided by adding a `public/runtime-config.json` file when in development environment, or by serving a `/runtime-config.json` file when in production environment. Example configuration file looks like this:

```json
{
  "backendUrl": "http://localhost:8000",
  "enableWebsocketSupport": true,
  "backendWSUrl": "ws://localhost:8000/ws",
  "useSecureCookie": true,
  "debug": true,
  "cookieDomain": "localhost",
  "defaultAutoRefreshInterval": 40,
  "realtimeServiceMaxRetries": 7,
  "use24hTime": true,
  "timestampDateFormat": "yyyy-MM-dd",
  "timestampTimeFormat": "HH:mm:ss",
  "timestampTimeNoSeconds": "HH:mm",
  "timestampTimezoneOffsetFormat": "xxx",
  "timestampFormat": "{date} {time}{timezone_offset}",
  "showSeverityLevels": true
}

```

#### Development environment
Either provide **environment** variables when running the frontend under the Node server (or in Docker Compose), or add `runtime-config.json` file with the **configuration** variables to the `/public` folder.

#### Production environment
Serve `runtime-config.json` file with the **configuration** variables. It must be accessible as `%YOUR_FRONTEND_BASE_URL%/runtime-config.json`.

Alternatively, you can configure the application via **environment** variables if using the production-oriented Docker image defined in `./docker/Dockerfile`. This image will automatically produce a `runtime-config.json` from the environment variables exported to the container, as well as other variables provided in the `./docker/runtime-config-template.json`. Read more in the [docker/README.md](docker/README.md).

#### Variables
These **environment** variables are available:

<dl>
  <dt>REACT_APP_BACKEND_URL</dt>
  <dd>The base URL to the Argus API server</dd>

  <dt>REACT_APP_ENABLE_WEBSOCKETS_SUPPORT</dt>
  <dd>Set to <code>true</code> to enable subscriptions to realtime incident updates</dd>

  <dt>REACT_APP_BACKEND_WS_URL</dt>
  <dd>If you enable websocket support, this must be set to the backend's websocket URL. This value may depend on whether your deployment splits the HTTP server and the Web Socket servers into two components. Typically, if the backend HTTP server is <code>https://argus-api.example.org/</code>, this value could be <code>wss://argus-api.example.org/ws</code>.</dd>

  <dt>REACT_APP_USE_SECURE_COOKIE</dt>
  <dd>Set explicitly to <code>false</code> to disable the use of secure cookies. Typically only useful when deploying the development environment using non-TLS servers/regular HTTP.</dd>

  <dt>REACT_APP_DEBUG</dt>
  <dd>Set to <code>true</code> if you want debug output from the application.</dd>

  <dt>REACT_APP_DEFAULT_AUTO_REFRESH_INTERVAL</dt>
  <dd>Set to the default number of seconds between each auto refresh</dd>

These environment variables are optional:

  <dt>REACT_APP_COOKIE_DOMAIN</dt>
  <dd>Ignore it if Argus frontend and backend are deployed on the same domain. Otherwise, set it to the same value as <code>ARGUS_COOKIE_DOMAIN</code> variable on the backend.</dd>
</dl>

**Configuration** variables can be provided in `runtime-config.json` file and will take precedence over the **environment** variables. These **configuration** variables are available:

<dl>
  <dt>backendUrl</dt>
  <dd>Format: string. The base URL to the Argus API server. MUST be provided in production environment, optional otherwise. </dd>

  <dt>cookieDomain</dt>
  <dd>Format: string. MUST be provided in production environment, optional otherwise.</dd>

  <dt>enableWebsocketSupport</dt>
  <dd>Format: boolean. Set to <code>true</code> to enable subscriptions to realtime incident updates.</dd>

  <dt>backendWSUrl</dt>
  <dd>Format: string. If you enable websocket support, this must be set to the backend's websocket URL. This value may depend on whether your deployment splits the HTTP server and the Web Socket servers into two components. Typically, if the backend HTTP server is <code>https://argus-api.example.org/</code>, this value could be <code>wss://argus-api.example.org/ws</code>.</dd>

  <dt>realtimeServiceMaxRetries</dt>
  <dd>Format: integer. If you enable websocket support, and it fails, this specifies how many times the application will retry connection before closing the socket.</dd>

  <dt>defaultAutoRefreshInterval</dt>
  <dd>Format: integer. Set to the default number of seconds between each auto refresh.</dd>

  <dt>debug</dt>
  <dd>Format: boolean. Set to <code>true</code> if you want debug output from the application.</dd>

  <dt>showSeverityLevels/dt>
  <dd>Format: boolean. Set to <code>true</code> if you want to enable filtering of incidents by severity levels.</dd>

  <dt>useSecureCookie</dt>
  <dd>Format: boolean. Set explicitly to <code>false</code> to disable the use of secure cookies. Typically only useful when deploying the development environment using non-TLS servers/regular HTTP.</dd>

  <dt>timestampFormat</dt>
  <dd>Format: string (valid ISO timestamp format). Specifies how a complete timestamp should be displayed.</dd>

  <dt>timestampDateFormat</dt>
  <dd>Format: string (valid ISO timestamp format). Specifies how dates should be displayed.</dd>
  
  <dt>timestampTimeFormat</dt>
  <dd>Format: string (valid ISO timestamp format). Specifies how time values should be displayed.</dd>

  <dt>timestampTimeNoSeconds</dt>
  <dd>Format: string (valid ISO timestamp format). Specifies how time values without seconds should be displayed.</dd>

  <dt>timestampTimezoneOffsetFormat</dt>
  <dd>Format: string (valid ISO timestamp format). Specifies how timezone should be displayed.</dd>

  <dt>use24hTime</dt>
  <dd>Format: boolean. Set to <code>true</code> if you want time values to be displayed in 24-hours-day format.</dd>
</dl>


### Using Docker Compose

This repository contains a `docker-compose.yml` definition to run all the backend components as services, while the Argus frontend runs directly off the checked out source code using npm. If you have Docker Compose on your system, run these commands to get everything up and running:

    export UID
    docker-compose up

(the `export UID` step is to ensure the Argus frontend container runs using your system UID, so it doesn't produce root-owned files in the mounted source code directory).

Your Argus frontend should now be served on `http://localhost:8080`, while your Argus API server should be served on `http://localhost:8000`. As with running `npm` locally, the website should automatically reload as you edit the code.

The default setup will install the latest version of the Argus API server from the master branch. If you need to customize which tag or branch to install, you can change the `BRANCH` argument in `docker-compose.yml` (or preferably implement your own `docker-compose.override.yml`).

## Running tests

Given that Argus-frontend is installed and configured as described above, the following command can be used to run all the tests:

    npm test

To run test files individually the following command can be used:

    npm test -- nameOfTestFile

To run a single test and skip all the others, the following command can be used:

    npm test -- -t "testName"

## Fixes for known annoyances, Linux

If you get the error message "React Native Error: ENOSPC: System limit for
number of file watchers reached" (the code will still run, but tests might
not), your version of React is probably not cleaning up its inotify watchers properly.

A temporary fix that always works is to reset the `node_modules` directory:

```
rm -rf node_modules
npm install
```

.. but the error will eventually be back.

A permanent fix for some Linuxes is to increase the value of
`fs.inotify.max_user_watches` in `/etc/sysctl.conf`. It's a number that is
divisible by **540** on 32bit systems and **1024** on 64bit-systems. The max is
**524288**.

## Coding guidelines

### Code structure

The folder structure of this project consists of components and views.
Each view component consists of other components.
`App.js` handles the routing to each view component that is displayed on the web app.

### Coding style

We use [prettier](https://github.com/prettier/prettier) for JavaScript auto-formatting.

We recommend using an editor plugin to automatically format code on save,
like [prettier-atom](https://atom.io/packages/prettier-atom) or
[vim-prettier](https://github.com/prettier/vim-prettier).

Another option to format the code is the `yarn prettier` command.

Lint errors will be displayed on the console while the app is running.

### CSS

The file `ColorScheme.css` defines the colors used in the project.
Additionally, there is one CSS file for each component.


## Using towncrier to automatically produce the changelog
To install towncrier using `pip` run
```console 
$ pip install towncrier
```

Alternatively you can also use `pipx` and run
```console 
$ pipx install towncrier
```

Or for Ubuntu 22.04 LTS or later run
```console
$ sudo apt-get update
$ sudo apt-get install towncrier
```

If it is not possible to install towncrier in the desired environment the files needed
to later automatically generate the changelog from can also be created using the editor
of one's choice as long as the [naming conventions](#before-merging-a-pull-request) are followed.

### Before merging a pull request
To be able to automatically produce the changelog for a release one file for each
pull request (also called news fragment) needs to be added to the folder
`changelog.d/`.

The name of the file consists of three parts separated by a period:
1. The identifier: either the issue number (in case the pull request fixes that issue)
or the pull request number. If we don't want to add a link to the resulting changelog
entry then a `+` followed by a unique short description.
2. The type of the change: we use `security`, `removed`, `deprecated`, `added`,
`changed` and `fixed`.
3. The file suffix, e.g. `.md`, towncrier does not care which suffix a fragment has.

So an example for a file name related to an issue/pull request would be `214.added.md`
or for a file without corresponding issue `+fixed-pagination-bug.fixed.md`.

This file can either be created manually with a file name as specified above and the
changelog text as content or one can use towncrier to create such a file as following:

```console
$ towncrier create -c "Changelog content" 214.added.md
```

When opening a pull request there will be a check to make sure that a news fragment is
added and it will fail if it is missing.

### Before a release
To add all content from the `changelog.d/` folder to the changelog file simply run
```console
$ towncrier build --version {version}
```
This will also delete all files in `changelog.d/`.

To preview what the addition to the changelog file would look like add the flag
`--draft`. This will not delete any files or change `CHANGELOG.md`. It will only output
the preview in the terminal.

A few other helpful flags:
- `date DATE` - set the date of the release, default is today
- `keep` - do not delete the files in `changelog.d/`

More information about [towncrier](https://towncrier.readthedocs.io).
