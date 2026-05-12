import { ElectronAPI } from '@electron-toolkit/preload'
export {}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ping: () => Promise<string>

      getAppVersion: () => Promise<string>

      openExternal: (url: string) => Promise<void>

      printReceipt: (
        payload: string,
        printerName: string
      ) => Promise<{ success: boolean; error?: string }>
    }
  }
}
