/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `../build/main.js` using webpack. This gives us some performance wins.
 */
// tslint:disable-next-line
/// <reference path="types.d.ts" />
import { app, BrowserWindow, shell, Event, nativeImage } from 'electron';
import logger from 'electron-log';
import { autoUpdater } from 'electron-updater';
import * as windowStateKeeper from 'electron-window-state';
import * as Splashscreen from '@trodi/electron-splashscreen';
import { URL } from 'url';
import MenuBuilder from './menu';

let mainWindow: BrowserWindow | null = null;

function processCommandLine(argv: string[]) {
  const lastArg = argv.pop();
  if (mainWindow && lastArg && lastArg.startsWith('stash:')) {
    mainWindow.webContents.send('stashLink', lastArg);
  }
}

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
if (process.env.NODE_ENV === 'production') {
  app.setAsDefaultProtocolClient('stash');
}
app.on('second-instance', (ev, commandLine) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();

    processCommandLine(commandLine);
  }
});
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

/* tslint:disable:no-var-requires */
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
/* tslint:enable:no-var-requires */

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

function cleanUrl(url: string) {
  const currentUrl = new URL(url);
  currentUrl.search = '';
  currentUrl.hash = '';
  return new URL('./', currentUrl).href;
}

logger.transports.file.level = 'info';
autoUpdater.logger = logger;

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
    defaultHeight: 960
  });

  const appIcon = process.env.NODE_ENV === 'development' ? `${__dirname}/icon.png` : nativeImage.createFromDataURL(require('./icon.png'));
  const mainOpts: Electron.BrowserWindowConstructorOptions = {
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    backgroundColor: '#ccc',
    icon: process.platform === 'linux' ? appIcon : undefined,
    autoHideMenuBar: true
    // frame: false
  };
  const config: Splashscreen.Config = {
    windowOpts: mainOpts,
    templateUrl: `${__dirname}/splash-screen.html`,
    delay: 250,
    splashScreenOpts: {
      width: 575,
      height: 350
    }
  };
  const splash = Splashscreen.initDynamicSplashScreen(config);
  (splash.splashScreen as any).buildDate = typeof BUILD_DATE === 'undefined' ? new Date() : new Date(BUILD_DATE);
  mainWindow = splash.main;

  mainWindowState.manage(mainWindow);

  mainWindow.loadURL(process.env.DEV_SERVER_ROOT || `file://${__dirname}/dist/index.html`);

  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();

    processCommandLine(process.argv);
  });

  // prevent internal navigation, open external links in default browser
  function handleNavigate(e: Event, url: string) {
    e.preventDefault();
    const currentCleanedUrl = cleanUrl(e.sender.getURL());
    const newCleanedUrl = cleanUrl(url);
    if (process.env.NODE_ENV === 'development') {
      console.log('navigate', url);
    }
    if (currentCleanedUrl !== newCleanedUrl) {
      // external link
      shell.openExternal(url);
    }
  }
  mainWindow.webContents.on('will-navigate', handleNavigate);
  mainWindow.webContents.on('new-window', handleNavigate);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  autoUpdater.checkForUpdatesAndNotify();
});