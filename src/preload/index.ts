import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = Object.freeze({
  ping: () => ipcRenderer.invoke('ping'),

  getAppVersion: () => ipcRenderer.invoke('app:get-version'),

  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),

  printReceipt: (payload) => ipcRenderer.invoke('print:receipt', payload),
})

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)

    contextBridge.exposeInMainWorld('api', api)
  } catch (err) {
    console.error(err)
  }
} else {
  // @ts-expect-error
  window.electron = electronAPI

  // @ts-expect-error
  window.api = api
}
