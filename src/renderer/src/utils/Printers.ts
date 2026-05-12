export async function printConfigPrinter(printerName: string) {
  try {
    await window.api.printReceipt({
      printerName,

      lines: [
        {
          value: 'CHEFCHEFE POS',

          style: {
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '20px'
          }
        },

        {
          value: '--------------------------------'
        },

        {
          value: `Teste da impressora ${printerName}`,

          style: {
            textAlign: 'center'
          }
        },

        {
          value: ''
        },

        {
          value: 'Você instalou corretamente a impressora.',

          style: {
            textAlign: 'center'
          }
        },

        {
          value: ''
        },

        {
          value:
            '--------------------------------'
        }
      ]
    })

    return {
      success: true
    }
  } catch (error) {
    console.error(error)

    return {
      success: false,
      error: String(error)
    }
  }
}

import { PosPrinter } from 'electron-pos-printer'

type ReceiptLine = {
  type: 'text'
  value: string
  style?: {
    fontWeight?: string
    textAlign?: 'left' | 'center' | 'right'
    fontSize?: string
  }
}

function lineSeparator() {
  return {
    type: 'text' as const,
    value: '--------------------------------'
  }
}

function money(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function twoColumns(left: string, right: string) {
  const totalWidth = 32

  const space = totalWidth - left.length - right.length

  return `${left}${' '.repeat(Math.max(space, 1))}${right}`
}

export async function printBillReceipt(payload: {
  printerName: string
  bill: {
    bill_number: string
    table: string
    subtotal: number
    tax: number
    total: number
  }
  items: {
    name: string
    quantity: number
    price: number
  }[]
  restaurant: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    phone: string
  }
}) {
  const { printerName, bill, items, restaurant } = payload
  const lines: ReceiptLine[] = []

  // HEADER
  lines.push({
    type: 'text',
    value: restaurant.name,
    style: {
      textAlign: 'center',
      fontWeight: '700',
      fontSize: '18px'
    }
  })

  lines.push({
    type: 'text',
    value: restaurant.street,
    style: {
      textAlign: 'center'
    }
  })

  lines.push({
    type: 'text',
    value: `${restaurant.city}/${restaurant.state}`,
    style: {
      textAlign: 'center'
    }
  })

  lines.push({
    type: 'text',
    value: restaurant.zip,
    style: {
      textAlign: 'center'
    }
  })

  lines.push({
    type: 'text',
    value: restaurant.phone,
    style: {
      textAlign: 'center'
    }
  })

  lines.push(lineSeparator())

  // COMANDA
  lines.push({
    type: 'text',
    value: `COMANDA: ${bill.bill_number}`
  })

  lines.push({
    type: 'text',
    value: `MESA: ${bill.table}`
  })

  lines.push({
    type: 'text',
    value: `DATA: ${new Date().toLocaleString()}`
  })

  lines.push(lineSeparator())

  // PRODUTOS
  lines.push({
    type: 'text',
    value: 'RESUMO',
    style: {
      textAlign: 'center',
      fontWeight: '700'
    }
  })

  items.forEach((item) => {
    lines.push({
      type: 'text',
      value: twoColumns(`${item.quantity}x ${item.name}`, money(item.price))
    })
  })

  lines.push(lineSeparator())

  // TOTALIZAÇÃO
  lines.push({
    type: 'text',
    value: twoColumns('Subtotal', money(bill.subtotal))
  })

  lines.push({
    type: 'text',
    value: twoColumns('Taxa', money(bill.tax))
  })

  lines.push({
    type: 'text',
    value: twoColumns('TOTAL', money(bill.total)),

    style: {
      fontWeight: '700'
    }
  })

  lines.push(lineSeparator())

  // FOOTER
  lines.push({
    type: 'text',
    value: 'Desenvolvido por Peditz',
    style: {
      textAlign: 'center',
      fontSize: '10px'
    }
  })

  lines.push({
    type: 'text',
    value: 'www.peditz.com.br',
    style: {
      textAlign: 'center',
      fontSize: '10px'
    }
  })

  const options = {
    preview: false,

    silent: true,

    copies: 1,

    printerName,

    margin: '0 0 0 0',

    pageSize: {
      width: 200000,
      height: 600000
    }
  }

  await PosPrinter.print(lines, options)
}
