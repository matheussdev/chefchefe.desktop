import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Tipos de exemplo
type ReceiptItem = { name: string; qty: number; price: number }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isItem = (x: any): x is ReceiptItem =>
  x && typeof x.name === 'string' && Number.isFinite(x.qty) && Number.isFinite(x.price)

// Sua API “mínima e segura” para o renderer
const api = Object.freeze({
  ping: () => ipcRenderer.invoke('ping'),
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  printReceipt: (items: ReceiptItem[]) => {
    if (!Array.isArray(items) || !items.every(isItem)) {
      throw new Error('Itens inválidos')
    }
    return ipcRenderer.invoke('print:receipt', { items })
  },
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url) // sanitize no main
})

if (process.contextIsolated) {
  try {
    // electronAPI: conjunto seguro (clipboard/shell/etc) provido pelo toolkit
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (err) {
    console.error(err)
  }
} else {
  // Fallback (não recomendado usar sem isolation)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  window.electron = electronAPI
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  window.api = api
}
