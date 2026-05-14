import { BrowserWindow } from 'electron'
import { SerialPort } from 'serialport'

let currentPort: SerialPort | null = null

const serialConfig = {
  baudRate: 2400,
  dataBits: 8 as const,
  stopBits: 1 as const,
  parity: 'none' as const
}
function sendToRenderer(channel: string, payload?: unknown): void {
  const win = BrowserWindow.getAllWindows()[0]

  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, payload)
  }
}

export async function listScalePorts(): Promise<SerialPort[]> {
  return await SerialPort.list()
}

export async function connectScale(path: string): Promise<boolean> {
  if (currentPort?.isOpen && currentPort.path === path) {
    console.log('Balança já conectada na porta', path)
    return true
  }

  currentPort = new SerialPort({
    path,
    ...serialConfig
  })

  currentPort.on('open', () => {
    console.log('BALANÇA CONECTADA')
  })

  let value = ''

  currentPort.on('data', (data) => {
    if (!data) return

    // byte ETX = fim da transmissão
    if (data[0] === 0x03) {
      const cleaned = value.replace(/[^0-9]/g, '')

      const kg = parseFloat(cleaned || '0') / 1000

      sendToRenderer('scale:weight', kg)

      console.log('Peso final:', kg)

      value = '' // limpa buffer
      return
    }

    value += data.toString()
  })

  currentPort.on('error', (err) => {
    console.error(err)

    sendToRenderer('scale:error', err.message)
  })

  currentPort.on('close', () => {
    console.log('BALANÇA DESCONECTADA')
  })

  return true
}

export async function disconnectScale(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!currentPort?.isOpen) {
      resolve(true)
      return
    }

    currentPort.close(() => {
      currentPort = null

      resolve(true)
    })
  })
}

export async function requestWeight(): Promise<boolean> {
  if (!currentPort?.isOpen) {
    throw new Error('Balança desconectada')
  }

  const enq = Buffer.from([0x05])

  currentPort.write(enq)

  return true
}

export async function checkConnectScale(): Promise<boolean> {
  return currentPort?.isOpen || false
}
