import escpos from 'escpos'
import USB from 'escpos-usb'
import Network from 'escpos-network'

escpos.USB = USB
escpos.Network = Network

type ReceiptItem = {
  name: string
  qty: number
  price: number
}

type PrintPayload = {
  items: ReceiptItem[]
  total: number
  printerType?: 'usb' | 'network'

  ip?: string
  port?: number

  vendorId?: number
  productId?: number
}

export async function printThermalReceipt(payload: PrintPayload) {
  return new Promise((resolve, reject) => {
    try {
      let device

      if (payload.printerType === 'network') {
        device = new escpos.Network(
          payload.ip || '192.168.0.100',
          payload.port || 9100
        )
      } else {
        device = new escpos.USB(
          payload.vendorId,
          payload.productId
        )
      }

      const printer = new escpos.Printer(device)

      device.open((error) => {
        if (error) {
          reject(error)
          return
        }

        printer
          .align('CT')
          .style('B')
          .size(1, 1)
          .text('CHEFCHEFE POS')
          .text('------------------------------')
          .align('LT')

        payload.items.forEach((item) => {
          printer.text(
            `${item.qty}x ${item.name} - R$ ${item.price.toFixed(2)}`
          )
        })

        printer
          .text('------------------------------')
          .align('RT')
          .style('B')
          .text(`TOTAL: R$ ${payload.total.toFixed(2)}`)
          .feed(2)
          .align('CT')
          .text('Obrigado pela preferência!')
          .cut()
          .close()

        resolve(true)
      })
    } catch (err) {
      reject(err)
    }
  })
}
