import { PosPrinter, PosPrintOptions, PosPrintType } from 'electron-pos-printer'
type ReceiptLine = {
  type: PosPrintType
  value: string
  style?: {
    fontWeight?: string
    textAlign?: 'left' | 'center' | 'right'
    fontSize?: string
  }
}

type PrintPayload = {
  printerName?: string
  lines: ReceiptLine[]
}

export async function printThermalReceipt(
  payload: PrintPayload
) {
  const data = payload.lines.map((line) => ({
    type: 'text' as PosPrintType,

    value: line.value,

    style: {
      fontFamily: 'monospace',
      fontSize: line.style?.fontSize || '12px',
      fontWeight: line.style?.fontWeight || '400',
      textAlign: line.style?.textAlign || 'left'
    }
  }))

  const options = {
    preview: false,

    silent: true,

    margin: '0 0 0 0',

    copies: 1,

    printerName: payload.printerName,

    timeOutPerLine: 400,
    pageSize: '80mm'
  } as unknown as PosPrintOptions

  await PosPrinter.print(data, options)
}
