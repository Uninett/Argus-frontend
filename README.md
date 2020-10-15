# Argus - Frontend

The Argus-frontend provides a graphical web interface to use with Argus. It has been built using React with TypeScript.
The backend can be found at https://github.com/Uninett/Argus.

Here's how to get started with development.


## Requirements

- Argus backend
- Node.js with npm

Set up the Argus backend according to the instructions in its repository (https://github.com/Uninett/Argus).

Furthermore, [Node.js](http://nodejs.org/) is required. We also use the [Node Package Manager (npm)](https://www.npmjs.com/), which comes bundled with Node.js.

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
