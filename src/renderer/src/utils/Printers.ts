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
  type: 'text' | 'table'
  value?: string
  style?: {
    border?: string
    fontWeight?: string
    textAlign?: 'left' | 'center' | 'right'
    fontSize?: string
  }
  tableHeader?: string[]
  tableBody?: (string | number)[][]
  tableFooter?: string[]
  tableHeaderStyle?: {
    backgroundColor?: string
    color?: string
  }
  tableBodyStyle?: {
    border?: string
  }
  tableFooterStyle?: {
    backgroundColor?: string
    color?: string
  }
}

function lineSeparator() {
  const totalWidth = 62
  return {
    type: 'text' as const,
    value: '-'.repeat(totalWidth),
    style: {
      textAlign: 'center',
      fontWeight: '700'
    }
  }
}

function money(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
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
  // items.forEach((item) => {
  //   lines.push({
  //     type: 'text',
  //     value: twoColumns(`${item.quantity}x ${item.name}`, money(item.price))
  //   })
  // })
  lines.push({
      type: 'table',
      style: {
        border: 'none'
      },
      // largura das colunas
      tableHeader: [
        {
          type: 'text',
          value: 'ITEM',
          style: {
            width: 0.75,
            fontWeight: '700'
          }
        },

        {
          type: 'text',
          value: 'VALOR',
          style: {
            width: 0.25,
            textAlign: 'right',
            fontWeight: '700'
          }
        }
      ],

      tableBody: items.map((item) => [
        {
          type: 'text',

          value: `${item.quantity}x ${item.name.length > 20 ? item.name.slice(0, 25) + '...' : item.name}`,

          style: {
            width: 0.75,
            textAlign: 'left',
            padding: '2px 0'
          }
        },

        {
          type: 'text',

          value: money(item.price),

          style: {
            width: 0.25,
            textAlign: 'right',
            padding: '2px 0'
          }
        }
      ]),
      tableBodyStyle: {
        border: 'none'
      }
    })

  lines.push({
    type: 'table',
    style: {
      border: '0px solid #fff'
    },
    tableBody: [[
      {
        type: 'text',
        value: 'Subtotal',

        style: {
          width: 0.75,
          textAlign: 'left',
          fontWeight: '700',
          border: 'none',

    padding: '2px 0'
        }
      },
      {
        type: 'text',
        value: money(bill.subtotal),
        style: {
          width: 0.25,
          textAlign: 'right',
          fontWeight: '700'
        }
      }
    ],
    [
      {
        type: 'text',
        value: 'Taxa de Serviço',
        style: {
          width: 0.75,
          textAlign: 'left',
          fontWeight: '700',
          border: '0px solid #fff',

    padding: '2px 0'
        }
      },
      {
        type: 'text',
        value: money(bill.tax),
        style: {
          width: 0.25,
          textAlign: 'right',
          fontWeight: '700',
          border: '0px solid #fff',

    padding: '2px 0'
        }
      }
    ],
    [
      {
        type: 'text',
        value: 'TOTAL',
        style: {
          width: 0.75,
          textAlign: 'left',
          fontWeight: '700',
          border: '0px solid #fff',

    padding: '2px 0'
        }
      },
      {
        type: 'text',
        value: money(bill.total),
        style: {
          width: 0.25,
          textAlign: 'right',
          fontWeight: '700',
          border: '0px solid #fff',
    padding: '2px 0'
        }
      }
    ],
    ],
    tableBodyStyle: {
      border: '0px solid #fff'
    }
  })
  lines.push({
    type: 'table',
    style: {
      border: '0px solid #fff'
    },
    tableBody: [[
      {
        type: 'text',
        value: '',

        style: {
          width: 0.75,
          textAlign: 'left',
          fontWeight: '700',
          border: 'none',

    padding: '2px 0'
        }
      },
      {
        type: 'text',
        value: ' ',
        style: {
          width: 0.25,
          textAlign: 'right',
          fontWeight: '700'
        }
      }
    ],
    [
      {
        type: 'text',
        value: '',
        style: {
          width: 0.75,
          textAlign: 'left',
          fontWeight: '700',
          border: '0px solid #fff',

    padding: '2px 0'
        }
      },
      {
        type: 'text',
        value: '  ',
        style: {
          width: 0.25,
          textAlign: 'right',
          fontWeight: '700',
          border: '0px solid #fff',

    padding: '2px 0'
        }
      }
    ],
    [
      {
        type: 'text',
        value: '',
        style: {
          width: 0.75,
          textAlign: 'left',
          fontWeight: '700',
          border: '0px solid #fff',

    padding: '2px 0'
        }
      },
      {
        type: 'text',
        value: '   ',
        style: {
          width: 0.25,
          textAlign: 'right',
          fontWeight: '700',
          border: '0px solid #fff',
    padding: '2px 0'
        }
      }
    ],
    [
      {
        type: 'text',
        value: '',
        style: {
          width: 0.75,
          textAlign: 'left',
          fontWeight: '700',
          border: '0px solid #fff',

    padding: '2px 0'
        }
      },
      {
        type: 'text',
        value: '  ',
        style: {
          width: 0.25,
          textAlign: 'right',
          fontWeight: '700',
          border: '0px solid #fff',

    padding: '2px 0'
        }
      }
    ],
    [
      {
        type: 'text',
        value: '',
        style: {
          width: 0.75,
          textAlign: 'left',
          fontWeight: '700',
          border: '0px solid #fff',

    padding: '2px 0'
        }
      },
      {
        type: 'text',
        value: '   ',
        style: {
          width: 0.25,
          textAlign: 'right',
          fontWeight: '700',
          border: '0px solid #fff',
    padding: '2px 0'
        }
      }
    ],
    
    ],
    tableBodyStyle: {
      border: '0px solid #fff'
    }
  })
  await window.api.printReceipt({
    printerName,
    lines
  })
}
