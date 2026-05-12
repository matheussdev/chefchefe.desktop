import fs from 'fs'
import { join } from 'path'

export async function printConfigPrinter(
  printerName: string,
) {
  const templatePath = join(__dirname, '../templates/configprinter.html')

  let html = fs.readFileSync(
    templatePath,
    'utf-8'
  )

  html = html
    .replace('{{printerName}}', printerName)
  try {
    await window.api.printReceipt(html, 'caixa')
    console.log('Receipt printed successfully')
    console.log(html)
    return { success: true }
  } catch (error) {
    console.error('Error printing receipt:', error)
    return { success: false, error: String(error) }
  }
}
