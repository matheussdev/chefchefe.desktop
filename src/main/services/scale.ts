import { BrowserWindow } from 'electron'
import { SerialPort } from 'serialport'

let currentPort: SerialPort | null = null

const serialConfig = {
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
  console.log(await SerialPort.list())
  return await SerialPort.list()
}

export async function connectScale(path: string, boundRate: number = 9600): Promise<boolean> {
  if (currentPort?.isOpen && currentPort.path === path) {
    console.log('Balança já conectada na porta', path)
    return true
  }
  currentPort = new SerialPort({
    path,
    ...serialConfig,
    baudRate: boundRate,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    rtscts: false,
    xon: false,
    xoff: false
  })

  currentPort.on('open', () => {
    console.log('BALANÇA CONECTADA')
    currentPort?.write(Buffer.from([0x05]), (err) => {
      console.log('ENQ enviado', err)
    })
  })

  currentPort.on('data', (data) => {
    // protocolo:
    // STX + S + PPPPP + ETX
    if (data.length < 3) {
      return
    }

    if (data[0] !== 0x02 || data[data.length - 1] !== 0x03) {
      return
    }

    const payload = data.toString('ascii').replace('\x02', '').replace('\x03', '').trim()

    const grams = parseInt(payload, 10)

    const kg = grams / 1000

    console.log('Peso:', kg)

    sendToRenderer('scale:weight', kg)
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
  console.log('Solicitado peso da balança')
  return true
}

export async function checkConnectScale(): Promise<boolean> {
  return currentPort?.isOpen || false
}
