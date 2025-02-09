/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `../build/main.js` using webpack. This gives us some performance wins.
 */
// eslint-disable-next-line
/// <reference path="types.d.ts" />
import { app, BrowserWindow, shell, nativeImage } from 'electron';
import logger from 'electron-log';
import unhandled from 'electron-unhandled';
import { autoUpdater } from 'electron-updater';
import windowStateKeeper from 'electron-window-state';
import * as remote from '@electron/remote/main';
import * as Splashscreen from '@trodi/electron-splashscreen';
import { URL } from 'url';
import MenuBuilder from './menu';

if (process.env.NODE_ENV === 'production') {
  unhandled();
}

remote.initialize();

let mainWindow: BrowserWindow | null = null;

function processCommandLine(argv: string[]) {
  const lastArg = argv.pop();
  if (mainWindow && lastArg && lastArg.startsWith('stash:')) {
    mainWindow.webContents.send('stashLink', lastArg);
  }
}

app.setAppUserModelId('de.doccrazy.Stash');
// required for NodeGit, see https://github.com/electron/electron/issues/18397
//app.allowRendererProcessReuse = false;

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
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(extensions.map((name) => installer.default(installer[name], forceDownload))).catch(console.log);
};

function cleanUrl(url: string) {
  const currentUrl = new URL(url);
  currentUrl.search = '';
  currentUrl.hash = '';
  return new URL('./', currentUrl).href;
}

logger.transports.file.level = 'info';
autoUpdater.logger = logger;

async function createMainWindow(reopen?: boolean) {
  if (!reopen && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true')) {
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
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  };
  const config: Splashscreen.Config = {
    windowOpts: mainOpts,
    templateUrl: `${__dirname}/splash-screen.html?appVersion=${app.getVersion()}&buildDate=${(typeof BUILD_DATE === 'undefined'
      ? new Date()
      : new Date(BUILD_DATE)
    ).toISOString()}`,
    delay: 250,
    splashScreenOpts: {
      width: 575,
      height: 350,
      webPreferences: { devTools: false }
    }
  };
  const splash = Splashscreen.initDynamicSplashScreen(config);
  mainWindow = splash.main;

  remote.enable(mainWindow.webContents);
  mainWindowState.manage(mainWindow);

  if (process.env.DEV_SERVER_ROOT) {
    // workaround for https://github.com/electron/electron/issues/19554
    setTimeout(() => {
      mainWindow!.loadURL(process.env.DEV_SERVER_ROOT!);
    });
  } else {
    mainWindow.loadFile('dist/index.html');
  }

  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();

    if (!reopen) {
      processCommandLine(process.argv);
    }
  });

  // prevent internal navigation, open external links in default browser
  function handleNavigate(url: string) {
    const currentCleanedUrl = cleanUrl(mainWindow!.webContents.getURL());
    try {
      const newCleanedUrl = cleanUrl(url);
      if (process.env.NODE_ENV === 'development') {
        console.log('navigate', url);
      }
      if (currentCleanedUrl !== newCleanedUrl) {
        // external link
        shell.openExternal(url);
      }
    } catch (err) {
      // invalid url
      console.error(err);
    }
  }
  mainWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    handleNavigate(url);
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    handleNavigate(details.url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  if (!reopen) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

app.whenReady().then(() => createMainWindow());

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow(true);
  }
});
