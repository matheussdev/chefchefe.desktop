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
    ...line,

    style: {
      fontFamily: 'Arial',
      fontSize: line.style?.fontSize || '12px',
      fontWeight: line.style?.fontWeight || '500',
      textAlign: line.style?.textAlign || 'left'
    }
  }))

  const options = {
    preview: false,

    silent: true,

    margins: {
		  marginType: "none"
	  },

    copies: 1,

    printerName: payload.printerName,

    timeOutPerLine: 400,
    pageSize: '80mm',
    footer: 'Sistama ChefChefe - www.chefchefe.com.br'
  } as unknown as PosPrintOptions

  await PosPrinter.print(data, options)
}
