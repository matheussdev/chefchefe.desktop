import { autoUpdater } from 'electron-updater'
import { BrowserWindow, ipcMain } from 'electron'

function sendToRenderer(
  event: string,
  payload?: unknown
) {
  const win = BrowserWindow.getAllWindows()[0]

  if (win) {
    win.webContents.send(event, payload)
  }
}

export function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('checking-for-update', () => {
    sendToRenderer('updater:checking')
  })

  autoUpdater.on('update-available', (info) => {
    sendToRenderer('updater:available', info)
  })

  autoUpdater.on('update-not-available', () => {
    sendToRenderer('updater:not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('updater:progress', progress)
  })

  autoUpdater.on('update-downloaded', () => {
    sendToRenderer('updater:downloaded')
  })

  autoUpdater.on('error', (err) => {
    sendToRenderer('updater:error', String(err))
  })

  ipcMain.handle('updater:install', () => {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.destroy()
      }
    })

    setImmediate(() => {
      autoUpdater.quitAndInstall(false, true)
    })
  })
}