import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

export function setupAutoUpdater() {
  autoUpdater.logger = log

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    log.info('Update available.', info)
  })

  autoUpdater.on('update-not-available', () => {
    log.info('Update not available.')
  })

  autoUpdater.on('error', (err) => {
    log.error('Updater error', err)
  })

  autoUpdater.on('download-progress', (progress) => {
    log.info(progress)
  })

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
  })
}
