import { BrowserWindow } from 'electron';

let screenSaverWindow: BrowserWindow | null = null;

export const createScreenSaverWindow = async (): Promise<void> => {
  if (screenSaverWindow) {
    return;
  }

  screenSaverWindow = new BrowserWindow({
    show: true,
    width: 1024,
    height: 728,
  });

  screenSaverWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });
  screenSaverWindow.isAlwaysOnTop();
  screenSaverWindow.setFullScreen(true);
  // make sure the screenSaverWindow is always on top
  screenSaverWindow.moveTop();
};

export const closeScreenSaverWindow = async (): Promise<void> => {
  if (screenSaverWindow) {
    screenSaverWindow.close();
    screenSaverWindow = null;
  }
};

export default createScreenSaverWindow;
