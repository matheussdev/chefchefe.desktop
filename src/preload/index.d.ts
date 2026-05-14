import { ElectronAPI } from '@electron-toolkit/preload'
export {}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      ping: () => Promise<string>

      reloadApp: () => Promise<void>

      getAppVersion: () => Promise<string>

      openExternal: (url: string) => Promise<void>

      printReceipt: (payload: {
        printerName?: string

        lines: {
          value?: string

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

      onUpdaterChecking: (callback: () => void) => void

      onUpdaterAvailable: (callback: (_: unknown, info: unknown) => void) => void

      onUpdaterProgress: (callback: (_: unknown, progress: { percent: number }) => void) => void

      onUpdaterDownloaded: (callback: () => void) => void

      onUpdaterError: (callback: (_: unknown, error: string) => void) => void

      installUpdate: () => Promise<void>

      listScalePorts: () => Promise<
        {
          path: string
          manufacturer?: string
        }[]
      >

      connectScale: (path: string) => Promise<void>

      disconnectScale: () => Promise<void>

      requestWeight: () => Promise<void>

      onScaleWeight: (callback: (_: unknown, weight: number) => void) => void

      removeScaleWeightListener: () => void

      onScaleError: (callback: (_: unknown, error: string) => void) => void

      removeScaleErrorListener: () => void

      checkConnectScale: () => Promise<boolean>
    }
  }
}
