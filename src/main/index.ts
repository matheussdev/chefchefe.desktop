import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setupAutoUpdater } from './updater'
import log from 'electron-log'
import { printThermalReceipt } from './printer/thermal'
log.initialize()

process.on('uncaughtException', (error) => {
  log.error(error)
})

process.on('unhandledRejection', (reason) => {
  log.error(reason)
})
function createWindow(): void {
  // Create the browser window.
  const splash = new BrowserWindow({
    width: 500,
    height: 300,

    transparent: true,
    frame: false,

    alwaysOnTop: true,

    resizable: false,
    movable: false,

    show: true
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    splash.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/splash.html`)
  } else {
    splash.loadFile(join(__dirname, '../renderer/splash.html'))
  }
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: '#F1F5F3',
    show: false,
    autoHideMenuBar: true,
    title: 'ChefChefe',
    titleBarStyle: 'hiddenInset',
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    splash.close()

    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // if (!is.dev) {
  //   mainWindow.webContents.on('before-input-event', (event, input) => {
  //     if (input.key === 'F12') {
  //       event.preventDefault()
  //     }
  //   })
  // }

  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault()
  })
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const mainWindow = BrowserWindow.getAllWindows()[0]

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.chefchefe.pos')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  setupAutoUpdater()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.handle('ping', () => 'pong')
ipcMain.handle('app:get-version', () => app.getVersion())

ipcMain.handle('shell:open-external', async (_e, url: string) => {
  try {
    const u = new URL(url)

    if (!['https:', 'http:'].includes(u.protocol)) {
      throw new Error('URL inválida')
    }

    await shell.openExternal(u.toString())
  } catch {
    throw new Error('URL inválida')
  }
})

ipcMain.handle(
  'print:receipt',
  async (_, payload) => {
    try {
      await printThermalReceipt(payload)

      return {
        success: true
      }
    } catch (error) {
      console.error(error)

      return {
        success: false,
        error: String(error)
      }
    }
  }
)

ipcMain.handle('app:reload', () => {
  const win = BrowserWindow.getAllWindows()[0]

  if (win) {
    win.reload()
  }
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
