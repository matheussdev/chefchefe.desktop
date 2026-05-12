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
        items: {
          name: string
          qty: number
          price: number
        }[]

        total: number

        printerType?: 'usb' | 'network'

        ip?: string
        port?: number

        vendorId?: number
        productId?: number
      }) => Promise<{
        success: boolean
        error?: string
      }>
    }
  }
}
