import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = Object.freeze({
  ping: () => ipcRenderer.invoke('ping'),

  getAppVersion: () => ipcRenderer.invoke('app:get-version'),

  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),

  printReceipt: (payload) => ipcRenderer.invoke('print:receipt', payload),

  reloadApp: () => ipcRenderer.invoke('app:reload'),

  onUpdaterChecking: (callback) => ipcRenderer.on('updater:checking', callback),

  onUpdaterAvailable: (callback) => ipcRenderer.on('updater:available', callback),

  onUpdaterProgress: (callback) => ipcRenderer.on('updater:progress', callback),

  onUpdaterDownloaded: (callback) => ipcRenderer.on('updater:downloaded', callback),

  onUpdaterError: (callback) => ipcRenderer.on('updater:error', callback),

  installUpdate: () => ipcRenderer.invoke('updater:install'),

  listScalePorts: () => ipcRenderer.invoke('scale:list-ports'),

  connectScale: (path: string) => ipcRenderer.invoke('scale:connect', path),

  disconnectScale: () => ipcRenderer.invoke('scale:disconnect'),

  requestWeight: () => ipcRenderer.invoke('scale:request-weight'),

  onScaleWeight: (callback: (_: unknown, weight: number) => void) =>
    ipcRenderer.on('scale:weight', callback)
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
