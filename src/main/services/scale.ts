import { BrowserWindow } from 'electron'
import { SerialPort } from 'serialport'

let currentPort: SerialPort | null = null

const serialConfig = {
  baudRate: 2400,
  dataBits: 8 as const,
  stopBits: 1 as const,
  parity: 'none' as const
}

function sendToRenderer(
  channel: string,
  payload?: unknown
) {
  const win = BrowserWindow.getAllWindows()[0]

  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, payload)
  }
}

export async function listScalePorts() {
  return await SerialPort.list()
}

export async function connectScale(
  path: string
) {
  if (currentPort?.isOpen) {
    await disconnectScale()
  }

  currentPort = new SerialPort({
    path,
    ...serialConfig
  })

  currentPort.on('open', () => {
    console.log('BALANÇA CONECTADA')
  })

  currentPort.on('data', (data) => {
    const asText = data.toString()

    const weight =
      asText
        .replace(/\r/g, '')
        .replace(/\n/g, '')
        .replace(/[^0-9]/g, '')

    sendToRenderer(
      'scale:weight',
      Number(weight) / 1000
    )
  })

  currentPort.on('error', (err) => {
    console.error(err)

    sendToRenderer(
      'scale:error',
      err.message
    )
  })

  currentPort.on('close', () => {
    console.log('BALANÇA DESCONECTADA')
  })

  return true
}

export async function disconnectScale() {
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

export async function requestWeight() {
  if (!currentPort?.isOpen) {
    throw new Error('Balança desconectada')
  }

  const enq = Buffer.from([0x05])

  currentPort.write(enq)
}
