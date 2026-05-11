export {}

declare global {
  interface Window {
    electron: typeof import('@electron-toolkit/preload').electronAPI
    api: {
      ping: () => Promise<string>
      getAppVersion: () => Promise<string>
    }
  }
}
