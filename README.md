# <img alt="Logo" src="https://raw.githubusercontent.com/Doccrazy/stash-electron/master/app/logo3.svg?sanitize=true" width="48" height="48"/> Stash - Team secret management made simple

[![Build Status](https://travis-ci.org/Doccrazy/stash-electron.svg?branch=master)](https://travis-ci.org/Doccrazy/stash-electron)

Stash is a graphical password and secret storage and management tool designed for collaboration, security and ease-of-use.
 
It features full end-to-end encryption and does not require a server component, giving you full control over who is able to access your secrets.

Stash will always be **fully open-source** without any subscriptions, "premium" features or hidden gotchas. You are free to use Stash in any environment, including commercially, as long as you respect the [GPL license](https://github.com/Doccrazy/stash-electron/blob/master/LICENSE).

## Features

- Desktop application for Windows/Linux/Mac
- Asymmetric end-to-end encryption using RSA and AES256
- No server component required, secrets are stored and versioned by a simple git repository
- Stores login credentials or any type of secret files
- Fully featured user and access rights management
- Git-based data integrity protection and audit log
- Batteries included: No external tools, complex setup or command line usage required

## Installation

Download the latest release from the releases page: [ ![GitHub release](https://img.shields.io/github/release/Doccrazy/stash-electron.svg) ](https://github.com/Doccrazy/stash-electron/releases).

For Debian or Ubuntu, add our Bintray repository to your sources, then install the package:
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 379CE192D401AB61
echo "deb https://dl.bintray.com/doccrazy/deb stable main" | sudo tee -a /etc/apt/sources.list
sudo apt update && sudo apt install stash-electron
```

Development snapshots are available for all platforms by installing the `stash-electron-git` package or downloading from the snapshots repository: [ ![Download](https://api.bintray.com/packages/doccrazy/bin/stash-electron-git/images/download.svg) ](https://bintray.com/doccrazy/bin/stash-electron-git/_latestVersion)

## Getting started

Stash requires a git repository to store its data. It is highly recommended to use a private, password-protected repository. All data is encrypted, the server owner will never get access to your secrets. Some free choices:
- [Bitbucket.org](https://bitbucket.org), free private repository for up to 5 users
- [Perforce Helix TeamHub](https://www.perforce.com/git-hosting), free private repository for up to 5 users
- [GitLab.com](https://gitlab.com/users/sign_in#register-pane), unlimited free private repositories
- Self-hosted: Run `git init --bare` on any accessible server

After creating the git repo, run Stash and navigate to the **Settings** page.
1. Clone your repository to an empty folder using the provided button.
2. Either load an existing private key (e.g. SSH key, all formats incl. Putty supported), or generate a new key by clicking the button. You should always **password-protect** your private key.  
:warning: Your private key is your access pass to your secrets. If you lose your key, you lose access to all your secrets, and there is no way of recovery. So **keep your key safe and secure, back it up and never share it with anyone!**
3. Save your changes.
4. Add yourself to the list of known users on the **Users** page (add user -> use my key). All users and public keys must be known to Stash. Again, do not forget to **save your changes**.
5. Open the **Browser** page and start creating folders and secrets!
6. Every change you make automatically creates a git commit. Use the flashing icon in the top right to **push/share your changes**.

## Development

Stash is a Node.js/React application running on [Electron](https://electronjs.org). To start development, you will need a recent Node.js/npm installation. 

### Install

First, clone the repo via git:

```bash
git clone https://github.com/Doccrazy/stash-electron.git stash-electron
```

And then install dependencies with npm.

```bash
cd stash-electron
npm install
```

### Run

Start the app in the `dev` environment. This starts the renderer process in [hot-module-replacement](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
npm run dev
```

### Packaging

To package apps for the local platform:

```bash
npm run package
```

To package apps for all platforms:

First, refer to [Multi Platform Build](https://www.electron.build/multi-platform-build) for dependencies.

Then,

```bash
npm run package all
```

## License
GPLv3 © [M. Piepkorn](https://github.com/Doccrazy)
