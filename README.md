# Aggregated Alert System - Frontend


## Requirements

For development, you will only need Node.js installed on your environment.

### Node

[Node](http://nodejs.org/) is really easy to install & now include [NPM](https://npmjs.org/).
You should be able to run the following command after the installation procedure
below.

    $ node --version
    v10.11.0

    $ npm --version
    6.4.1

#### Node installation on OS X

You will need to use a Terminal. On OS X, you can find the default terminal in
`/Applications/Utilities/Terminal.app`.

Please install [Homebrew](http://brew.sh/) if it's not already done with the following command.

    $ ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"

If everything when fine, you should run

    brew install node

#### Node installation on Linux

    sudo apt-get install python-software-properties
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs

#### Node installation on Windows

Just go on [official Node.js website](http://nodejs.org/) & grab the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it.

---

## Install

    $ git clone https://github.com/ddabble/aas-frontend
    $ cd aas-frontend
    $ npm install

Installs all the dependencies for the project.

## Start & watch
    $ npm start

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## Code structure
The folder structure of this project is split into components and views.Each view component is built up using other components. App.js handles the routing to each view component that is displayed on the page.

## Prettier

We use [prettier](https://github.com/prettier/prettier) for JS auto-formatting.
We highly recommend using format on save via an editor plugin,
for example [prettier-atom](https://atom.io/packages/prettier-atom) and
[vim-prettier](https://github.com/prettier/vim-prettier).

You can also format the code via `yarn prettier`.

## CSS
ColorScheme.css defines every color used in the project and each component has their own css file.

## Backend
Can be found here: https://github.com/ddabble/aas



