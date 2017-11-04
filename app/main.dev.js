/* eslint global-require: 1 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, shell } from 'electron';
import windowStateKeeper from 'electron-window-state';
import { URL } from 'url';
import MenuBuilder from './menu';

let mainWindow = null;

function processCommandLine(argv) {
  const lastArg = argv.pop();
  if (lastArg && lastArg.startsWith('stash:')) {
    mainWindow.webContents.send('stashLink', lastArg);
  }
}

if (process.env.NODE_ENV === 'production') {
  app.setAsDefaultProtocolClient('stash');
}
const isSecondInstance = app.makeSingleInstance(commandLine => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    processCommandLine(commandLine);
  }
});
if (isSecondInstance) {
  app.quit();
}

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};

function cleanUrl(url) {
  const currentUrl = new URL(url);
  currentUrl.search = '';
  currentUrl.hash = '';
  return new URL('./', currentUrl).href;
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 960,
  });

  mainWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    backgroundColor: '#ccc',
    autoHideMenuBar: true
  });

  mainWindowState.manage(mainWindow);

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();

    processCommandLine(process.argv);
  });

  // prevent internal navigation, open external links in default browser
  const handleNavigate = (e, url) => {
    e.preventDefault();
    const currentCleanedUrl = cleanUrl(mainWindow.webContents.getURL());
    const newCleanedUrl = cleanUrl(url);
    if (process.env.NODE_ENV === 'development') {
      console.log('navigate', url);
    }
    if (currentCleanedUrl !== newCleanedUrl) {
      // external link
      shell.openExternal(url);
    }
  };
  mainWindow.webContents.on('will-navigate', handleNavigate);
  mainWindow.webContents.on('new-window', handleNavigate);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
