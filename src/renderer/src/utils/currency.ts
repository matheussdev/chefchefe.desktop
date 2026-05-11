export const currenyFormat = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

export const parseCurrency = (value: string): number => {
  const parsed = Number(value.replace(/[R$\s.]/g, '').replace(',', '.'))
  return isNaN(parsed) ? 0 : parsed
}



export function formatToBRL(value: string): string {
  // Limpa os caracteres que não são números
  const onlyNumbers = value?.replace(/\D+/g, '')

  // Converte para um formato numérico para facilitar a formatação
  const numberValue = parseInt(onlyNumbers, 10) || 0

  // Divide por 100 para obter os centavos
  const floatNumber = numberValue / 100

  // Usa o objeto Intl para formatar para a moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(floatNumber).replace('R$', '').trim()
}

export function brlToNumber(value: string): number {
  // Remove o prefixo R$, espaços e outros caracteres não-numéricos, e substitui vírgula por ponto
  const sanitizedValue = value.replace(/R\$\s?|[^0-9,]/g, '').replace(',', '.')

  // Converte a string limpa para um número
  return parseFloat(sanitizedValue)
}

export function formatCurrency(
  value: number,
  locale: string = 'pt-BR',
  currency: string = 'BRL'
): string {
  const formattedValue = value?.toLocaleString(locale, { style: 'currency', currency })
  return formattedValue
}
