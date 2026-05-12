import { ElectronAPI } from '@electron-toolkit/preload'
export {}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ping: () => Promise<string>

      getAppVersion: () => Promise<string>

      openExternal: (url: string) => Promise<void>

      printReceipt: (payload: {
        printerName?: string

        lines: {
          value: string

          style?: {
            fontWeight?: string
            textAlign?: 'left' | 'center' | 'right'
            fontSize?: string
          }
        }[]
      }) => Promise<{
        success: boolean
        error?: string
      }>
    }
  }
}
