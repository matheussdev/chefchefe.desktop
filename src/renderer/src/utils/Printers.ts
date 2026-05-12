export async function printConfigPrinter(
  printerName: string
) {
  try {
    await window.api.printReceipt({
      printerName,

      lines: [
        {
          value: 'CHEFCHEFE POS',

          style: {
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '18px'
          }
        },

        {
          value:
            '--------------------------------'
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
          value:
            'Você instalou corretamente a impressora.',

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
        },

        {
          value: 'Peditz Soluções',

          style: {
            textAlign: 'center',
            fontWeight: '700'
          }
        },

        {
          value: 'www.peditz.com.br',

          style: {
            textAlign: 'center'
          }
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
