/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { machineIdSync } from 'node-machine-id';
import { closeScreenSaverWindow, createScreenSaverWindow } from './screensaver';
import AppUpdater from './app-updater';
import { resolveHtmlPath } from './util';
// import MenuBuilder from './menu';

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

let screenSaverInterval: NodeJS.Timeout | null = null;

ipcMain.on('register-screen-saver', async (event, arg) => {
  if (screenSaverInterval) {
    clearInterval(screenSaverInterval);
  }
  screenSaverInterval = setInterval(() => {
    createScreenSaverWindow();
  }, arg);
});

ipcMain.on('unregister-screen-saver', async (event, arg) => {
  if (screenSaverInterval) {
    clearInterval(screenSaverInterval);
  }
  closeScreenSaverWindow();
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const machineId = machineIdSync(true);

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false,
      allowRunningInsecureContent: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  let url = `https://app.signageful.com/player?serial=${machineId}`;
  if (isDebug) {
    url = `https://app.signageful.dev/player?serial=${machineId}`;
  }

  // this is used when we would like to use the `renderer`
  // mainWindow.loadURL(resolveHtmlPath('index.html'));
  mainWindow.loadURL(`${resolveHtmlPath('index.html')}?target=${url}`);
  // mainWindow.loadURL(`https://app.signageful.com/player?serial=${machineId}`);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: Object.fromEntries(
          Object.entries(details.responseHeaders || {}).filter(
            (header) => !/x-frame-options/i.test(header[0])
          )
        ),
      });
    }
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/*
 * Add event listeners...
 */

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.commandLine.appendSwitch('disable-site-isolation-trials');

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
