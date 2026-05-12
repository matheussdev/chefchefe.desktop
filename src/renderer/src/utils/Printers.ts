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
      textAlign: 'left'
    }
  })

  lines.push({
    type: 'text',
    value: `${restaurant.city}/${restaurant.state}`,
    style: {
      textAlign: 'left'
    }
  })

  lines.push({
    type: 'text',
    value: restaurant.zip,
    style: {
      textAlign: 'left'
    }
  })

  lines.push({
    type: 'text',
    value: restaurant.phone,
    style: {
      textAlign: 'left'
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
  // Header da tabela
  lines.push({
    type: 'text',
    value: twoColumns('QTD  DESCRIÇÃO', 'VALOR'),
    style: {
      fontWeight: '700',
      textAlign: 'left'
    }
  })
  items.forEach((item) => {
    const truncateName = item.name.length > 20 ? item.name.slice(0, 17) + '...' : item.name
    lines.push({
      type: 'text',
      value: twoColumns(`${item.quantity}x ${truncateName}`, money(item.price))
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

  await window.api.printReceipt({
    printerName,
    lines
  })
}
