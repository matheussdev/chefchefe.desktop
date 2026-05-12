import { BrowserWindow, ipcMain } from 'electron'

ipcMain.handle(
  'print:receipt',
  async (_, html: string, printerName?: string) => {
    const win = new BrowserWindow({
      show: false
    })

    await win.loadURL(`
      data:text/html;charset=utf-8,
      ${encodeURIComponent(html)}
    `)

    return new Promise((resolve, reject) => {
      win.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName: printerName
        },
        (success, errorType) => {
          win.close()

          if (!success) {
            reject(errorType)
            return
          }

          resolve(true)
        }
      )
    })
  }
)
